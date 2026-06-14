import { Router } from 'express';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { ActivityService } from '../services/activity-service';

export const activityRouter = Router();

activityRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const activities = await ActivityService.getRecent(householdId, limit);

  return res.json(activities);
});
