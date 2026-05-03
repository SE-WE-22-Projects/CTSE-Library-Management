import { useEffect, useState } from 'react';
import { notificationsApi } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { Bell, Mail, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface Notification {
  _id: string;
  recipient: string;
  subject: string;
  content: string;
  status: string;
  createdAt: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch notifications specific to the current user
        const data = await notificationsApi.getHistoryByRecipient(user.email);

        // Sort descending by date
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-pulse h-8 w-8 bg-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Stay updated on your library account activity.</p>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {notifications.length === 0 ? (
          <div className="text-center p-12 border rounded-xl border-dashed bg-card">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">All caught up!</h3>
            <p className="text-muted-foreground">You don't have any notifications right now.</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card key={notification._id} className="overflow-hidden hover:shadow-md transition-shadow border-border/50">
              <CardHeader className="p-4 pb-2 bg-muted/20 flex flex-row items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base leading-none">{notification.subject}</CardTitle>
                    <CardDescription className="text-xs mt-1.5 flex items-center gap-2">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {user?.permissions?.includes('Admin') && (
                        <span className="text-muted-foreground">• To: {notification.recipient}</span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={notification.status === 'SENT' ? 'default' : 'secondary'}
                       className={notification.status === 'SENT' ? 'bg-green-500/10 text-green-500 border-none' : ''}>
                  {notification.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-3 text-sm flex items-start gap-3">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-foreground/90">{notification.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
