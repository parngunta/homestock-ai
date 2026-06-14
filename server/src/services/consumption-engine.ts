import { prisma } from '../utils/db';

export class ConsumptionEngine {
  static async recordConsumption(inventoryItemId: string, householdId: string): Promise<void> {
    const adjustments = await prisma.inventoryAdjustment.findMany({
      where: { inventoryItemId, type: 'REMOVE' },
      orderBy: { createdAt: 'asc' },
    });

    if (adjustments.length === 0) return;

    const firstAdjustment = adjustments[0];
    const lastAdjustment = adjustments[adjustments.length - 1];

    const totalUsed = adjustments.reduce((sum, adj) => sum + adj.quantity, 0);
    const usageDurationMs = lastAdjustment.createdAt.getTime() - firstAdjustment.createdAt.getTime();
    const usageDurationDays = usageDurationMs / (1000 * 60 * 60 * 24);

    if (usageDurationDays < 0.5) return;

    const averageDailyConsumption = totalUsed / usageDurationDays;

    await prisma.consumptionRecord.create({
      data: {
        inventoryItemId,
        householdId,
        quantityUsed: totalUsed,
        usageDurationDays,
        averageDailyConsumption,
      },
    });
  }

  static async predictForItem(
    inventoryItemId: string,
    householdId: string
  ): Promise<{
    averageConsumptionRate: number;
    remainingDays: number | null;
    predictedOutDate: string | null;
  }> {
    const records = await prisma.consumptionRecord.findMany({
      where: { inventoryItemId, householdId },
      orderBy: { recordedAt: 'desc' },
      take: 10,
    });

    const item = await prisma.inventoryItem.findUnique({ where: { id: inventoryItemId } });
    if (!item) {
      return { averageConsumptionRate: 0, remainingDays: null, predictedOutDate: null };
    }

    if (records.length === 0) {
      const adjustments = await prisma.inventoryAdjustment.findMany({
        where: { inventoryItemId },
        orderBy: { createdAt: 'asc' },
      });

      if (adjustments.length < 2) {
        return { averageConsumptionRate: 0, remainingDays: null, predictedOutDate: null };
      }

      const removeAdjustments = adjustments.filter((a) => a.type === 'REMOVE');
      if (removeAdjustments.length === 0) {
        return { averageConsumptionRate: 0, remainingDays: null, predictedOutDate: null };
      }

      const first = adjustments[0];
      const last = adjustments[adjustments.length - 1];
      const totalUsed = removeAdjustments.reduce((sum, adj) => sum + adj.quantity, 0);
      const durationDays = (last.createdAt.getTime() - first.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (durationDays < 1) {
        return { averageConsumptionRate: 0, remainingDays: null, predictedOutDate: null };
      }

      const avgDaily = totalUsed / durationDays;
      const remaining = avgDaily > 0 ? item.quantity / avgDaily : null;
      const predictedOut = remaining !== null ? new Date(Date.now() + remaining * 24 * 60 * 60 * 1000).toISOString() : null;

      return {
        averageConsumptionRate: Math.round(avgDaily * 1000) / 1000,
        remainingDays: remaining !== null ? Math.round(remaining * 10) / 10 : null,
        predictedOutDate: predictedOut,
      };
    }

    const avgDaily = records.reduce((sum, r) => sum + r.averageDailyConsumption, 0) / records.length;
    const remaining = avgDaily > 0 ? item.quantity / avgDaily : null;
    const predictedOut = remaining !== null ? new Date(Date.now() + remaining * 24 * 60 * 60 * 1000).toISOString() : null;

    return {
      averageConsumptionRate: Math.round(avgDaily * 1000) / 1000,
      remainingDays: remaining !== null ? Math.round(remaining * 10) / 10 : null,
      predictedOutDate: predictedOut,
    };
  }

  static async getLowStockItems(householdId: string) {
    const items = await prisma.inventoryItem.findMany({
      where: {
        householdId,
        isArchived: false,
        minimumThreshold: { gt: 0 },
      },
    });

    return items.filter((item) => item.quantity <= item.minimumThreshold);
  }

  static async getPredictedOutSoonItems(householdId: string, daysThreshold: number = 7) {
    const items = await prisma.inventoryItem.findMany({
      where: { householdId, isArchived: false, quantity: { gt: 0 } },
    });

    const predictions = await Promise.all(
      items.map(async (item) => {
        const prediction = await this.predictForItem(item.id, householdId);
        return { ...item, ...prediction };
      })
    );

    return predictions.filter(
      (p) => p.remainingDays !== null && p.remainingDays <= daysThreshold
    );
  }
}