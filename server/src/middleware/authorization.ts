import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../utils/db';

export const requireRole = (roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId!;
    const householdId = req.params.householdId || req.body.householdId;

    if (!householdId) {
      return res.status(400).json({ error: 'Household ID required' });
    }

    const member = await prisma.householdMember.findFirst({
      where: { userId, householdId },
    });

    if (!member || !roles.includes(member.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireMembership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  const householdId = req.params.householdId || req.body.householdId;

  if (!householdId) {
    return res.status(400).json({ error: 'Household ID required' });
  }

  const member = await prisma.householdMember.findFirst({
    where: { userId, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  next();
};