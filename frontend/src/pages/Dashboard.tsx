import { useEffect, useState } from 'react';
import { booksApi, lendingsApi } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { BookOpen, Library, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ totalBooks: 0, activeLendings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [books, lendings] = await Promise.all([
          booksApi.getAll(),
          lendingsApi.getAll()
        ]);
        setStats({
          totalBooks: books.length || 0,
          activeLendings: lendings.filter((l: { status: string }) => l.status === 'ACTIVE').length || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><div className="animate-pulse h-8 w-8 bg-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.username}</h1>
        <p className="text-muted-foreground">Here is what's happening with your library account today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Books Available</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Lendings</CardTitle>
            <Library className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLendings}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently borrowed out</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all hover:-translate-y-1 bg-gradient-to-br from-card to-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground mt-1">No outstanding fines</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
         {/* More dashboard widgets could go here */}
         <div className="h-64 rounded-xl border bg-card text-card-foreground shadow flex flex-col items-center justify-center p-6 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="font-semibold text-lg">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-2">Activity feed will appear here as you borrow and return books.</p>
         </div>
         <div className="h-64 rounded-xl border bg-card text-card-foreground shadow flex flex-col items-center justify-center p-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="font-semibold text-lg">Recommended Reads</h3>
            <p className="text-sm text-muted-foreground mt-2">Explore the Books Catalog to find your next great read.</p>
         </div>
      </div>
    </div>
  );
}
