import { prisma } from '../utils/db';

export type ActivityType =
  | 'ITEM_CREATED'
  | 'ITEM_UPDATED'
  | 'ITEM_ADJUSTED'
  | 'ITEM_ARCHIVED'
  | 'ITEM_RESTORED'
  | 'ITEM_ADDED_FROM_RECEIPT'
  | 'SHOPPING_ITEM_CREATED'
  | 'SHOPPING_ITEM_PURCHASED'
  | 'SHOPPING_ITEM_DELETED'
  | 'MEMBER_JOINED'
  | 'MEMBER_INVITED'
  | 'MEMBER_REMOVED'
  | 'HOUSEHOLD_CREATED'
  | 'PREDICTION_ALERT'
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK_ALERT'
  | 'EXPIRING_SOON_ALERT';

export class ActivityService {
  static async record({
    householdId,
    userId,
    type,
    message,
    metadata,
  }: {
    householdId: string;
    userId?: string;
    type: ActivityType;
    message: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.activity.create({
      data: {
        householdId,
        userId,
        type,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  static async getRecent(householdId: string, limit = 20) {
    return prisma.activity.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }
}
