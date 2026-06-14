import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { AIService } from '../services/ai-service';

export const aiRouter = Router();

aiRouter.post('/:householdId/chat', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  try {
    const inventory = await prisma.inventoryItem.findMany({
      where: { householdId, isArchived: false },
    });

    const shoppingItems = await prisma.shoppingListItem.findMany({
      where: { householdId, status: 'PENDING' },
    });

    const lowStockItems = inventory.filter(
      (item) => item.minimumThreshold > 0 && item.quantity <= item.minimumThreshold
    );

    const prompt = AIService.buildPrompt(message, inventory, shoppingItems, lowStockItems);
    const response = await AIService.chat(prompt);

    return res.json({ message: response });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'AI service error' });
  }
});