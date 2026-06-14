import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/new-ui/card';
import { CalendarDays, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = currentDate.getDate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="px-5 lg:px-8 pt-6 pb-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base text-muted-foreground mb-1">Calendar</p>
          <h1 className="text-hero text-foreground">{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h1>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-soft">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <Card className="border-border/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-5">
            <button className="p-2 rounded-xl hover:bg-secondary">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <p className="font-semibold">{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
            <button className="p-2 rounded-xl hover:bg-secondary">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-medium transition-colors ${
                    isToday ? 'bg-primary text-white' : 'hover:bg-secondary'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold mb-1">No events yet</p>
          <p className="text-sm text-muted-foreground">Track expiry dates, shopping trips, and household events here.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
