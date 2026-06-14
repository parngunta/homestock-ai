import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/new-ui/card';
import { BarChart3, TrendingUp, Package, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Total items tracked', value: '128', change: '+12%', icon: Package, color: 'bg-blue-500' },
    { label: 'Items running low', value: '5', change: '-2', icon: AlertTriangle, color: 'bg-amber-500' },
    { label: 'Shopping items', value: '8', change: '+3', icon: ShoppingCart, color: 'bg-violet-500' },
    { label: 'Weekly consumption', value: '24', change: '+8%', icon: TrendingUp, color: 'bg-primary' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="px-5 lg:px-8 pt-6 pb-6 space-y-6"
    >
      <div>
        <p className="text-base text-muted-foreground mb-1">Analytics</p>
        <h1 className="text-hero text-foreground">Household insights</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/40">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-xl ${stat.color} bg-opacity-15 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-').replace('500', '600')}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xs font-medium text-primary mt-1">{stat.change} this week</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Consumption trends</h3>
            <button className="text-sm text-primary font-semibold flex items-center gap-0.5">
              Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-48 bg-secondary/40 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mb-1">Analytics coming soon</p>
          <p className="text-sm text-muted-foreground">Detailed reports on spending, consumption, and predictive refill trends will appear here.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
