import { useEffect, useState } from 'react';
import { usersApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Trash2, Plus, Shield, User } from 'lucide-react';
import { AxiosError } from 'axios';

interface UserData {
  _id: string;
  username: string;
  email: string;
  permissions: string[];
}

export function ManageUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const permissions = isAdmin ? ['User', 'Admin'] : ['User'];
      await usersApi.create({
        username, email, password, permissions
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setIsAdmin(false);
      await loadUsers();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      await loadUsers();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">Add new users to the system and manage their access.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isAdmin" className="cursor-pointer">Grant Admin Privileges</Label>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : <><Plus className="w-4 h-4 mr-2" /> Create User</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              {u.permissions?.includes('Admin') ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>
                            {u.username}
                          </div>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.permissions?.map((perm) => (
                              <Badge key={perm} variant={perm === 'Admin' ? 'default' : 'secondary'} className={perm === 'Admin' ? 'bg-primary/20 text-primary border-none hover:bg-primary/30' : ''}>
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(u._id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
