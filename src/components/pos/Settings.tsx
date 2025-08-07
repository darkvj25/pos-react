import { useState } from 'react';
import { usePosData } from '@/hooks/usePosData';
import { usePosAuth } from '@/hooks/usePosAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Store, Save, Users, UserPlus, UserX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types/pos';

export const Settings = () => {
  const { settings, updateSettings, users, addUser, updateUser, deleteUser, getUserByUsername } = usePosData();
  const { currentUser } = usePosAuth();
  const [formData, setFormData] = useState(settings);
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
    fullName: '',
    role: 'cashier' as 'admin' | 'cashier',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast({
      title: "Settings Updated",
      description: "Business settings have been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">Settings</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Configure your business information</p>
      </div>

      <Card className="pos-card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tin">TIN</Label>
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => setFormData({...formData, tin: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="birPermitNumber">BIR Permit Number</Label>
                <Input
                  id="birPermitNumber"
                  value={formData.birPermitNumber}
                  onChange={(e) => setFormData({...formData, birPermitNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="receiptFooter">Receipt Footer</Label>
              <Textarea
                id="receiptFooter"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({...formData, receiptFooter: e.target.value})}
                placeholder="Thank you message for receipts"
              />
            </div>

            <Button type="submit" className="pos-button-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>

      {currentUser?.role === 'admin' && (
        <Card className="pos-card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </div>
              <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogTrigger asChild>
                  <Button className="pos-button-primary">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (getUserByUsername(newUserData.username)) {
                      toast({
                        title: "Username Taken",
                        description: "Please choose a different username",
                        variant: "destructive",
                      });
                      return;
                    }
                    addUser(newUserData);
                    setShowUserModal(false);
                    setNewUserData({
                      username: '',
                      password: '',
                      fullName: '',
                      role: 'cashier',
                    });
                    toast({
                      title: "User Created",
                      description: "New user has been added successfully",
                    });
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUserData.username}
                        onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUserData.password}
                        onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={newUserData.fullName}
                        onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUserData.role}
                        onValueChange={(value: 'admin' | 'cashier') => 
                          setNewUserData({...newUserData, role: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cashier">Cashier</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full pos-button-primary">
                      Create User
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-[hsl(var(--muted-foreground))]">No users found</p>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{user.fullName}</h4>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          @{user.username} • {user.role}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10"
                          onClick={() => {
                            if (user.id === currentUser?.id) {
                              toast({
                                title: "Cannot Delete",
                                description: "You cannot delete your own account",
                                variant: "destructive",
                              });
                              return;
                            }
                            if (confirm('Are you sure you want to delete this user?')) {
                              deleteUser(user.id);
                              toast({
                                title: "User Deleted",
                                description: "User has been removed successfully",
                              });
                            }
                          }}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};