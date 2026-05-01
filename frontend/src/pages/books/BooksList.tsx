import { useEffect, useState } from 'react';
import { booksApi, lendingsApi } from '../../lib/api';
import { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BookOpen } from 'lucide-react';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  isAvailable: boolean;
}

export function BooksList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await booksApi.getAll();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId: string) => {
    if (!user) return;
    setBorrowing(bookId);
    try {
      await lendingsApi.create({ bookId, userId: user._id });
      // Reload books to update availability (or just update local state)
      await loadBooks();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(null);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-pulse h-8 w-8 bg-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Books Catalog</h1>
        <p className="text-muted-foreground">Discover and borrow your next great read.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <Card key={book._id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20 border-border/50">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <Badge variant={book.isAvailable ? 'default' : 'secondary'} className={book.isAvailable ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none' : ''}>
                  {book.isAvailable ? 'Available' : 'Borrowed'}
                </Badge>
                <Badge variant="outline" className="text-xs">{book.category}</Badge>
              </div>
              <CardTitle className="mt-4 text-xl line-clamp-1" title={book.title}>{book.title}</CardTitle>
              <CardDescription className="text-sm">by {book.author}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="h-32 w-full bg-muted/30 rounded-md mb-4 flex items-center justify-center border border-dashed border-muted-foreground/20">
                 <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {book.description || 'No description available for this book.'}
              </p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50">
              <Button 
                className="w-full" 
                disabled={!book.isAvailable || borrowing === book._id}
                onClick={() => handleBorrow(book._id)}
              >
                {borrowing === book._id ? 'Borrowing...' : book.isAvailable ? 'Borrow Now' : 'Not Available'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center p-12 border rounded-xl border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h3 className="text-lg font-semibold">No books found</h3>
          <p className="text-muted-foreground">The library catalog is currently empty.</p>
        </div>
      )}
    </div>
  );
}
