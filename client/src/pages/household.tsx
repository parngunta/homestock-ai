import { useState } from 'react';
import { useHouseholdStore } from '@/stores/household-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { UserPlus, Trash2, Copy, Home } from 'lucide-react';

export default function HouseholdPage() {
  const { currentHousehold, createHousehold, inviteMember, removeMember, joinHousehold } = useHouseholdStore();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [householdName, setHouseholdName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!householdName) return;
    await createHousehold(householdName);
    setShowCreateModal(false);
    setHouseholdName('');
  };

  const handleInvite = async () => {
    if (!currentHousehold || !inviteEmail) return;
    await inviteMember(currentHousehold.id, inviteEmail, inviteRole);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleJoin = async () => {
    if (!joinCode) return;
    await joinHousehold(joinCode);
    setShowJoinModal(false);
    setJoinCode('');
  };

  const copyInviteCode = () => {
    if (currentHousehold?.inviteCode) {
      navigator.clipboard.writeText(currentHousehold.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-700';
      case 'ADMIN': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Household</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoinModal(true)}>Join Household</Button>
          <Button onClick={() => setShowCreateModal(true)}><Home className="w-4 h-4 mr-1" /> Create Household</Button>
        </div>
      </div>

      {currentHousehold ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{currentHousehold.name}</CardTitle>
              <Button size="sm" onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4 mr-1" /> Invite
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Invite Code</p>
                  <p className="font-mono font-bold text-lg">{currentHousehold.inviteCode}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyInviteCode}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentHousehold.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">
                        {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.user?.name}</p>
                        <p className="text-xs text-gray-500">{member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                      {member.role !== 'OWNER' && member.userId !== user?.id && (
                        <button
                          onClick={() => removeMember(currentHousehold.id, member.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Home className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>You're not part of a household yet.</p>
          <p className="text-sm">Create one or join an existing household.</p>
        </div>
      )}

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Household</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Household Name</Label>
              <Input value={householdName} onChange={(e) => setHouseholdName(e.target.value)} placeholder="My Home" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="member@example.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInvite}>Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Join Household</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="Enter invite code" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinModal(false)}>Cancel</Button>
            <Button onClick={handleJoin}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}