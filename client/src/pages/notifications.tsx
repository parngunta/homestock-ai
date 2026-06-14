import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification-store';
import { useHouseholdStore } from '@/stores/household-store';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, CheckCircle, AlertTriangle, TrendingDown, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_ICONS: Record<string, typeof Bell> = {
  LOW_STOCK: AlertTriangle,
  OUT_OF_STOCK: AlertTriangle,
  PREDICTED_OUT: TrendingDown,
  SHOPPING_REMINDER: ShoppingCart,
  HOUSEHOLD_INVITATION: CheckCircle,
};

const TYPE_COLORS: Record<string, string> = {
  LOW_STOCK: 'text-orange-500 bg-orange-50',
  OUT_OF_STOCK: 'text-red-500 bg-red-50',
  PREDICTED_OUT: 'text-yellow-500 bg-yellow-50',
  SHOPPING_REMINDER: 'text-purple-500 bg-purple-50',
  HOUSEHOLD_INVITATION: 'text-green-500 bg-green-50',
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markRead, markAllRead } = useNotificationStore();
  const { currentHousehold } = useHouseholdStore();

  useEffect(() => {
    if (currentHousehold) fetchNotifications(currentHousehold.id);
  }, [currentHousehold?.id]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => currentHousehold && markAllRead(currentHousehold.id)}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.type] || Bell;
            const colorClass = TYPE_COLORS[notification.type] || 'text-gray-500 bg-gray-50';
            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-shadow hover:shadow-sm ${!notification.isRead ? 'border-l-4 border-l-green-500' : ''}`}
                onClick={() => !notification.isRead && markRead(notification.id)}
              >
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.isRead ? '' : 'text-gray-500'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    )}
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