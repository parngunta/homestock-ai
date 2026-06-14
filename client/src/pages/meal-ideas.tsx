import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles, ArrowRight, Clock } from 'lucide-react';

export default function MealIdeasPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="px-5 lg:px-8 pt-6 pb-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-muted-foreground mb-1">Meal Ideas</p>
          <h1 className="text-hero text-foreground">What's for dinner?</h1>
        </div>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">Beta</span>
      </div>

      <Card className="gradient-green text-white border-0 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold mb-1">AI Meal Suggestions</p>
              <p className="text-white/80 text-sm">Get recipe ideas based on what's in your inventory.</p>
              <Button className="mt-4 rounded-full bg-white text-primary hover:bg-white/90" size="sm">
                Generate ideas <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Quick 30-min meals', 'Family favorites', 'Use it up first', 'Low stock recipes'].map((title, i) => (
          <Card key={title} className="border-border/40">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{8 - i * 2} ideas</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mb-1">Coming soon</p>
          <p className="text-sm text-muted-foreground">We're cooking up smart meal planning based on your household inventory and preferences.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
