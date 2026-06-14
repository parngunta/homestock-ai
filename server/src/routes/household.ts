import { Router } from 'express';
import { ActivityService } from '../services/activity-service';
import { prisma } from '../utils/db';
import { AuthRequest, getParam } from '../middleware/auth';
import { createHouseholdSchema, inviteMemberSchema } from '../utils/validations';
import { v4 as uuidv4 } from 'uuid';

export const householdRouter = Router();

householdRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createHouseholdSchema.parse(req.body);

    const household = await prisma.household.create({
      data: { name: data.name, inviteCode: uuidv4().slice(0, 8).toUpperCase() },
    });

    await prisma.householdMember.create({
      data: {
        userId: req.userId!,
        householdId: household.id,
        role: 'OWNER',
      },
    });

    const user = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId: household.id,
      userId: req.userId!,
      type: 'HOUSEHOLD_CREATED',
      message: `${user?.name || 'Someone'} created the household ${household.name}`,
      metadata: { householdId: household.id },
    });

    return res.status(201).json(household);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

householdRouter.get('/', async (req: AuthRequest, res) => {
  const memberships = await prisma.householdMember.findMany({
    where: { userId: req.userId! },
    include: { household: true },
  });

  return res.json(memberships.map((m) => m.household));
});

householdRouter.get('/:householdId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');

  const member = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!member) {
    return res.status(403).json({ error: 'Not a member of this household' });
  }

  const household = await prisma.household.findUnique({
    where: { id: householdId },
    include: { members: { include: { user: { select: { id: true, email: true, name: true, avatarUrl: true } } } } },
  });

  return res.json(household);
});

householdRouter.post('/:householdId/invite', async (req: AuthRequest, res) => {
  try {
    const householdId = getParam(req, 'householdId');
    const data = inviteMemberSchema.parse(req.body);

    const membership = await prisma.householdMember.findFirst({
      where: { userId: req.userId!, householdId },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only owners and admins can invite members' });
    }

    const userToInvite = await prisma.user.findUnique({ where: { email: data.email } });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = await prisma.householdMember.findFirst({
      where: { userId: userToInvite.id, householdId },
    });

    if (existing) {
      return res.status(409).json({ error: 'User is already a member' });
    }

    const newMember = await prisma.householdMember.create({
      data: { userId: userToInvite.id, householdId, role: data.role },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    const inviter = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
    await ActivityService.record({
      householdId,
      userId: req.userId!,
      type: 'MEMBER_INVITED',
      message: `${inviter?.name || 'Someone'} invited ${userToInvite.name || data.email} to the household`,
      metadata: { memberId: newMember.id, role: data.role },
    });

    return res.status(201).json(newMember);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

householdRouter.delete('/:householdId/members/:memberId', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const memberId = getParam(req, 'memberId');

  const membership = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
    return res.status(403).json({ error: 'Only owners and admins can remove members' });
  }

  const targetMember = await prisma.householdMember.findUnique({ where: { id: memberId } });
  if (!targetMember) {
    return res.status(404).json({ error: 'Member not found' });
  }

  if (targetMember.role === 'OWNER') {
    return res.status(403).json({ error: 'Cannot remove the owner' });
  }

  await prisma.householdMember.delete({ where: { id: memberId } });

  const remover = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
  await ActivityService.record({
    householdId,
    userId: req.userId!,
    type: 'MEMBER_REMOVED',
    message: `${remover?.name || 'Someone'} removed ${targetMember.userId === req.userId! ? 'themselves' : 'a member'} from the household`,
    metadata: { memberId },
  });

  return res.json({ success: true });
});

householdRouter.post('/:householdId/transfer-ownership', async (req: AuthRequest, res) => {
  const householdId = getParam(req, 'householdId');
  const { newOwnerId } = req.body;

  const membership = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId },
  });

  if (!membership || membership.role !== 'OWNER') {
    return res.status(403).json({ error: 'Only the owner can transfer ownership' });
  }

  const targetMember = await prisma.householdMember.findFirst({
    where: { id: newOwnerId, householdId },
  });

  if (!targetMember) {
    return res.status(404).json({ error: 'Member not found' });
  }

  await prisma.$transaction([
    prisma.householdMember.update({ where: { id: membership.id }, data: { role: 'ADMIN' } }),
    prisma.householdMember.update({ where: { id: newOwnerId }, data: { role: 'OWNER' } }),
  ]);

  return res.json({ success: true });
});

householdRouter.post('/join', async (req: AuthRequest, res) => {
  const { inviteCode } = req.body;

  const household = await prisma.household.findUnique({ where: { inviteCode } });
  if (!household) {
    return res.status(404).json({ error: 'Invalid invite code' });
  }

  const existing = await prisma.householdMember.findFirst({
    where: { userId: req.userId!, householdId: household.id },
  });

  if (existing) {
    return res.status(409).json({ error: 'Already a member of this household' });
  }

  const member = await prisma.householdMember.create({
    data: { userId: req.userId!, householdId: household.id, role: 'MEMBER' },
    include: { household: true },
  });

  const joiner = await prisma.user.findUnique({ where: { id: req.userId! }, select: { name: true } });
  await ActivityService.record({
    householdId: household.id,
    userId: req.userId!,
    type: 'MEMBER_JOINED',
    message: `${joiner?.name || 'Someone'} joined the household`,
    metadata: { householdId: household.id },
  });

  return res.status(201).json(member);
});