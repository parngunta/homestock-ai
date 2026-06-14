import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';

export const barcodeRouter = Router();

barcodeRouter.get('/lookup/:barcode', async (req: AuthRequest, res) => {
  const barcode = getParam(req, 'barcode');

  const product = await prisma.barcodeProduct.findUnique({
    where: { barcode },
  });

  if (product) {
    return res.json({ found: true, product });
  }

  return res.json({ found: false });
});

barcodeRouter.post('/create', async (req: AuthRequest, res) => {
  try {
    const { barcode, name, brand, category, unit, imageUrl } = req.body;

    if (!barcode || !name) {
      return res.status(400).json({ error: 'Barcode and name are required' });
    }

    const product = await prisma.barcodeProduct.create({
      data: {
        barcode,
        name,
        brand,
        category: category || null,
        unit: unit || null,
        imageUrl: imageUrl || null,
      },
    });

    return res.status(201).json(product);
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Barcode already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});