import { useEffect, useState } from 'react';
import { lendingsApi } from '../../lib/api';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface Lending {
  _id: string;
  bookId: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE';
  reservedDate: string;
  returnDate: string;
  fineAmount: number;
  extensionAttempts: number;
}

export function MyLendings() {
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadLendings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadLendings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await lendingsApi.getUserHistory(user._id);
      setLendings(data);
    } catch (err) {
      console.error('Failed to load lendings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    setProcessingId(id);
    try {
      await lendingsApi.returnBook(id);
      await loadLendings();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to return book');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExtend = async (id: string) => {
    setProcessingId(id);
    try {
      await lendingsApi.extend(id);
      await loadLendings();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to extend lending');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-pulse h-8 w-8 bg-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">My Lendings</h1>
        <p className="text-muted-foreground">Manage your borrowed books, extensions, and returns.</p>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Book ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Borrowed Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Fines</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lendings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  You haven't borrowed any books yet.
                </TableCell>
              </TableRow>
            ) : (
              lendings.map((lending) => (
                <TableRow key={lending._id} className="group">
                  <TableCell className="font-mono text-xs">{lending.bookId}</TableCell>
                  <TableCell>
                    <Badge variant={lending.status === 'ACTIVE' ? 'default' : lending.status === 'RETURNED' ? 'secondary' : 'destructive'} 
                           className={lending.status === 'ACTIVE' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none' : ''}>
                      {lending.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(lending.reservedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{new Date(lending.returnDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={lending.fineAmount > 0 ? "text-destructive font-bold" : "text-muted-foreground"}>
                      ${lending.fineAmount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {lending.status === 'ACTIVE' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={lending.extensionAttempts >= 2 || processingId === lending._id}
                          onClick={() => handleExtend(lending._id)}
                          className="h-8 transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Extend ({2 - lending.extensionAttempts} left)
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          disabled={processingId === lending._id}
                          onClick={() => handleReturn(lending._id)}
                          className="h-8"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Return
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
