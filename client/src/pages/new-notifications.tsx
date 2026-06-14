import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/new-ui/badge';
import { Bell, AlertTriangle, TrendingDown, ShoppingCart, CheckCircle } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: typeof Bell; label: string; variant: 'default' | 'primary' | 'warning' | 'danger' | 'success' | 'ghost' }> = {
  LOW_STOCK: { icon: AlertTriangle, label: 'Low Stock', variant: 'warning' },
  OUT_OF_STOCK: { icon: AlertTriangle, label: 'Out of Stock', variant: 'danger' },
  PREDICTED_OUT: { icon: TrendingDown, label: 'Running Out', variant: 'warning' },
  SHOPPING_REMINDER: { icon: ShoppingCart, label: 'Shopping', variant: 'primary' },
  HOUSEHOLD_INVITATION: { icon: CheckCircle, label: 'Household', variant: 'success' },
};

export default function NewNotificationsPage() {
  const { notifications, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const { currentHousehold } = useHouseholdStore();

  useEffect(() => {
    if (currentHousehold) fetchNotifications(currentHousehold.id);
  }, [currentHousehold?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => currentHousehold && markAllRead(currentHousehold.id)} className="rounded-full">
            Mark all read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16">
          <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-5">
            <Bell className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            We’ll alert you when items run low, run out, or need restocking.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.LOW_STOCK;
            const Icon = config.icon;
            return (
              <Card
                key={n.id}
                className={`overflow-hidden cursor-pointer transition-all ${!n.isRead ? 'border-l-4 border-l-primary' : ''}`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-${config.variant === 'danger' ? 'destructive' : config.variant === 'warning' ? 'warning' : config.variant === 'primary' ? 'primary' : 'secondary'}/10`}>
                      <Icon className={`w-5 h-5 ${config.variant === 'danger' ? 'text-destructive' : config.variant === 'warning' ? 'text-warning' : config.variant === 'primary' ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-medium text-sm ${!n.isRead ? '' : 'text-muted-foreground'}`}>{n.title}</p>
                        {!n.isRead && <Badge variant="primary" size="sm">New</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
