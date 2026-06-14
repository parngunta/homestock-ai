import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { AIService } from '../services/ai-service';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const receiptRouter = Router();

receiptRouter.post('/:householdId/upload', upload.single('receipt'), async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  const receiptImport = await prisma.receiptImport.create({
    data: {
      householdId,
      userId: req.userId!,
      imageUrl,
      status: 'PENDING',
    },
  });

  try {
    if (process.env.OPENAI_API_KEY) {
      const base64 = require('fs').readFileSync(req.file.path, { encoding: 'base64' });
      const mimeType = req.file.mimetype;

      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all items from this receipt. Return a JSON array with fields: name, quantity, price. Only return valid JSON, no other text.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const ocrText = response.choices[0]?.message?.content || '';
      await prisma.receiptImport.update({
        where: { id: receiptImport.id },
        data: { ocrText, parsedItems: ocrText, status: 'REVIEWED' },
      });

      return res.json({ id: receiptImport.id, imageUrl, parsedItems: ocrText, status: 'REVIEWED' });
    }
  } catch (err) {
    return res.json({ id: receiptImport.id, imageUrl, status: 'PENDING', error: 'OCR processing failed' });
  }

  return res.json({ id: receiptImport.id, imageUrl, status: 'PENDING' });
});

receiptRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const receipts = await prisma.receiptImport.findMany({
    where: { householdId },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(receipts);
});

receiptRouter.post('/:householdId/:receiptId/import', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const receiptId = getParam(req, 'receiptId');
  const { items } = req.body as { items: { name: string; quantity: number; category?: string; unit?: string }[] };

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const createdItems = await prisma.$transaction(
    items.map((item) =>
      prisma.inventoryItem.create({
        data: {
          householdId,
          name: item.name,
          quantity: item.quantity || 1,
          category: (item.category as any) || 'OTHER',
          unit: (item.unit as any) || 'PIECE',
        },
      })
    )
  );

  await prisma.receiptImport.update({
    where: { id: receiptId },
    data: { status: 'IMPORTED' },
  });

  return res.json(createdItems);
});