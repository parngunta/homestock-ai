import { useEffect, useState } from 'react';
import { useHouseholdStore } from '@/stores/household-store';
import { useAuthStore } from '@/stores/auth-store';
import { useActivityStore } from '@/stores/activity-store';
import { Card, CardContent } from '@/components/new-ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { Avatar } from '@/components/new-ui/avatar';
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
      <div className="px-5 pt-6 pb-6 space-y-6">
        <header>
          <h1 className="text-[28px] font-semibold tracking-tight">Household</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create or join a household to manage supplies together.</p>
        </header>
        <div className="space-y-3">
          <Button onClick={() => setShowCreate(true)} className="w-full rounded-full">
            <Home className="w-4 h-4 mr-2" />
            Create Household
          </Button>
          <Button variant="outline" onClick={() => setShowJoin(true)} className="w-full rounded-full">
            Join with Code
          </Button>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Household</DialogTitle></DialogHeader>
            <Input placeholder="My Home" value={householdName} onChange={(e) => setHouseholdName(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showJoin} onOpenChange={setShowJoin}>
          <DialogContent>
            <DialogHeader><DialogTitle>Join Household</DialogTitle></DialogHeader>
            <Input placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowJoin(false)}>Cancel</Button>
              <Button onClick={handleJoin}>Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const isOwner = currentHousehold.members?.some((m) => m.userId === user?.id && m.role === 'OWNER');

  return (
    <div className="px-5 pt-6 pb-6 space-y-7">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Household</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{currentHousehold.name}</p>
      </header>

      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Invite code</p>
              <p className="text-2xl font-semibold tracking-wider font-mono">{currentHousehold.inviteCode}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyCode} className="rounded-full">
              <Copy className="w-4 h-4 mr-1" />
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with family members so they can join.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Members</h2>
          <Button size="sm" onClick={() => setShowInvite(true)} className="rounded-full">
            <UserPlus className="w-4 h-4 mr-1" />
            Invite
          </Button>
        </div>

        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          {currentHousehold.members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-3 bg-card">
              <div className="flex items-center gap-3">
                <Avatar name={member.user?.name || '?'} size="md" />
                <div>
                  <p className="font-medium text-[15px]">{member.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-md ${member.role === 'OWNER' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {member.role}
                </span>
                {isOwner && member.userId !== user?.id && member.role !== 'OWNER' && (
                  <button
                    onClick={() => removeMember(currentHousehold.id, member.id)}
                    className="w-9 h-9 rounded-full hover:bg-secondary text-muted-foreground flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Activity</h2>
        <Card className="border-border">
          <CardContent className="p-4 space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 10).map((activity) => {
                const Icon = activityIcon(activity.type);
                const color = activityColor(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user?.name || 'HomeStock'}</span>{' '}
                        <span className="text-muted-foreground">{activity.message}</span>
                      </p>
                      <p className="text-xs text-muted-foreground/70">{formatActivityTime(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                Activity feed will appear here as household members add, purchase, and update items.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
          <Input placeholder="Email address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
  if (type.includes('PURCHASED')) return 'bg-success/10 text-success';
  if (type.includes('ALERT')) return 'bg-destructive/10 text-destructive';
  if (type.includes('MEMBER')) return 'bg-primary/10 text-primary';
  if (type.includes('SHOPPING')) return 'bg-primary/10 text-primary';
  return 'bg-secondary text-muted-foreground';
}
