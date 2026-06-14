import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useHouseholdStore } from '@/stores/household-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, AlertTriangle, ShoppingCart, TrendingDown, MessageSquare, Plus } from 'lucide-react';
import type { DashboardData } from '@/types';

export default function DashboardPage() {
  const { currentHousehold } = useHouseholdStore();

  const { data: dashboard, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', currentHousehold?.id],
    queryFn: async () => {
      const res = await api.get(`/dashboard/${currentHousehold!.id}`);
      return res.data;
    },
    enabled: !!currentHousehold,
  });

  if (!currentHousehold) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold mb-2">No Household Yet</h2>
        <p className="text-gray-500 mb-4">Create or join a household to get started.</p>
        <Link to="/household">
          <Button>Create Household</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link to="/inventory">
          <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
        </Link>
      </div>

      {dashboard?.insights && dashboard.insights.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="space-y-1">
                {dashboard.insights.map((insight, i) => (
                  <p key={i} className="text-sm text-green-800">{insight}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{dashboard?.totalItems ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{dashboard?.lowStockItems?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Running Out Soon</p>
                <p className="text-2xl font-bold">{dashboard?.predictedOutSoon?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Shopping List</p>
                <p className="text-2xl font-bold">{dashboard?.shoppingItems?.length ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.lowStockItems && dashboard.lowStockItems.length > 0 ? (
              <div className="space-y-3">
                {dashboard.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} left</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      Below {item.minimumThreshold}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No low stock items</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Predicted to Run Out</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.predictedOutSoon && dashboard.predictedOutSoon.length > 0 ? (
              <div className="space-y-3">
                {dashboard.predictedOutSoon.map((item) => (
                  <div key={item.itemId} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} {item.unit} remaining</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      ~{item.remainingDays} days left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No items predicted to run out soon</p>
            )}
          </CardContent>
        </Card>
      </div>

      {dashboard?.categoryCounts && dashboard.categoryCounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {dashboard.categoryCounts.map((cat) => (
                <div key={cat.category} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{cat._count}</p>
                  <p className="text-xs text-gray-500 capitalize">{cat.category.toLowerCase()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}