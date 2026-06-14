import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';

export const notificationRouter = Router();

notificationRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId!, householdId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return res.json(notifications);
});

notificationRouter.patch('/:notificationId/read', async (req: AuthRequest, res) => {
  const notificationId = getParam(req, 'notificationId');

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== req.userId!) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return res.json(updated);
});

notificationRouter.post('/mark-all-read', async (req: AuthRequest, res) => {
  const { householdId } = req.body;

  await prisma.notification.updateMany({
    where: { userId: req.userId!, householdId, isRead: false },
    data: { isRead: true },
  });

  return res.json({ success: true });
});