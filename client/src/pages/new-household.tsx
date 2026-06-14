import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHouseholdStore } from '@/stores/household-store';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Avatar } from '@/components/new-ui/avatar';
import { Badge } from '@/components/new-ui/badge';
import { EmptyState } from '@/components/new-ui/empty-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/new-ui/dialog';
import {
  Home,
  UserPlus,
  Copy,
  Trash2,
  ShoppingCart,
  Package,
  Plus,
  Check,
  User,
  AlertTriangle,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 320, damping: 28 } },
};

export default function NewHouseholdPage() {
  const { currentHousehold, createHousehold, inviteMember, removeMember, joinHousehold } = useHouseholdStore();
  const { user } = useAuthStore();
  const { activities, fetchActivities } = useActivityStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentHousehold) fetchActivities(currentHousehold.id);
  }, [currentHousehold?.id]);

  const handleCreate = async () => {
    if (!householdName) return;
    await createHousehold(householdName);
    setShowCreate(false);
    setHouseholdName('');
  };

  const handleInvite = async () => {
    if (!currentHousehold || !inviteEmail) return;
    await inviteMember(currentHousehold.id, inviteEmail, 'MEMBER');
    setShowInvite(false);
    setInviteEmail('');
  };

  const handleJoin = async () => {
    if (!joinCode) return;
    await joinHousehold(joinCode);
    setShowJoin(false);
    setJoinCode('');
  };

  const copyCode = () => {
    if (currentHousehold?.inviteCode) {
      navigator.clipboard.writeText(currentHousehold.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!currentHousehold) {
    return (
      <motion.div
        className="px-5 pt-6 pb-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header variants={itemVariants} className="space-y-1">
          <h1 className="text-hero">Household</h1>
          <p className="text-base text-muted-foreground">Create or join a household to manage supplies together.</p>
        </motion.header>

        <motion.div variants={itemVariants} className="space-y-3">
          <Button onClick={() => setShowCreate(true)} className="w-full rounded-full h-14 text-lg">
            <Home className="w-5 h-5 mr-2" /> Create Household
          </Button>
          <Button variant="outline" onClick={() => setShowJoin(true)} className="w-full rounded-full h-14 text-lg">
            Join with Code
          </Button>
        </motion.div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Create Household</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="e.g. The Smith Home"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="rounded-2xl h-14 text-base"
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowCreate(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleCreate} className="rounded-full">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showJoin} onOpenChange={setShowJoin}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Join Household</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="rounded-2xl h-14 text-base font-mono tracking-widest"
            />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowJoin(false)} className="rounded-full">Cancel</Button>
              <Button onClick={handleJoin} className="rounded-full">Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  }

  const isOwner = currentHousehold.members?.some((m) => m.userId === user?.id && m.role === 'OWNER');

  return (
    <motion.div
      className="px-5 pt-6 pb-6 space-y-7"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.header variants={itemVariants} className="space-y-1">
        <h1 className="text-hero">Household</h1>
        <p className="text-base text-muted-foreground">{currentHousehold.name}</p>
      </motion.header>

      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-0.5">Invite code</p>
                <p className="text-3xl font-bold tracking-widest font-mono">{currentHousehold.inviteCode}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyCode} className="rounded-full h-10 px-4">
                <Copy className="w-4 h-4 mr-1.5" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <p className="text-base text-muted-foreground">Share this code with family members so they can join.</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-title">Members</h2>
          <Button size="sm" onClick={() => setShowInvite(true)} className="rounded-full h-10 px-4">
            <UserPlus className="w-4 h-4 mr-1.5" /> Invite
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {currentHousehold.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.user?.name || '?'} size="md" />
                    <div>
                      <p className="font-semibold text-base">{member.user?.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'OWNER' ? 'primary' : 'ghost'} size="sm">
                      {member.role}
                    </Badge>
                    {isOwner && member.userId !== user?.id && member.role !== 'OWNER' && (
                      <button
                        onClick={() => removeMember(currentHousehold.id, member.id)}
                        className="w-10 h-10 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        aria-label={`Remove ${member.user?.name || 'member'}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemVariants} className="space-y-4">
        <h2 className="text-title">Recent Activity</h2>
        {activities.length > 0 ? (
          <Card className="overflow-hidden">
            <CardContent className="p-5 space-y-4">
              {activities.slice(0, 10).map((activity) => {
                const Icon = activityIcon(activity.type);
                const color = activityColor(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base">
                        <span className="font-semibold">{activity.user?.name || 'HomeStock'}</span>{' '}
                        <span className="text-muted-foreground">{activity.message}</span>
                      </p>
                      <p className="text-sm text-muted-foreground/70">{formatActivityTime(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Check}
            title="All quiet here"
            description="Activity will appear when household members add, purchase, or update items."
          >
            <Button variant="outline" className="rounded-full px-6">Add first item</Button>
          </EmptyState>
        )}
      </motion.section>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Invite Member</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="rounded-2xl h-14 text-base"
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowInvite(false)} className="rounded-full">Cancel</Button>
            <Button onClick={handleInvite} className="rounded-full">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function formatActivityTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function activityIcon(type: string): typeof ShoppingCart {
  if (type.includes('SHOPPING')) return ShoppingCart;
  if (type.includes('MEMBER')) return User;
  if (type.includes('HOUSEHOLD')) return Check;
  if (type.includes('ARCHIVED')) return Package;
  if (type.includes('ADJUSTED')) return Plus;
  if (type.includes('ALERT')) return AlertTriangle;
  return Package;
}

function activityColor(type: string): string {
  if (type.includes('PURCHASED')) return 'bg-emerald-100 text-emerald-700';
  if (type.includes('ALERT')) return 'bg-red-100 text-red-700';
  if (type.includes('MEMBER')) return 'bg-violet-100 text-violet-700';
  if (type.includes('SHOPPING')) return 'bg-blue-100 text-blue-700';
  return 'bg-secondary text-muted-foreground';
}
