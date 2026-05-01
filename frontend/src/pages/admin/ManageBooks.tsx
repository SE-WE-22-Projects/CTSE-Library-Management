import { useEffect, useState } from 'react';
import { booksApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { AxiosError } from 'axios';

interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

export function ManageBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await booksApi.create({
        title, author, description, category, price: Number(price)
      });
      setTitle('');
      setAuthor('');
      setDescription('');
      setCategory('');
      setPrice('');
      await loadBooks();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to create book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await booksApi.delete(id);
      await loadBooks();
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{message: string}>;
      alert(axiosError.response?.data?.message || 'Failed to delete book');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Manage Books</h1>
        <p className="text-muted-foreground">Add new books to the catalog and manage existing ones.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Add New Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add Book</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Books Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
                    </TableRow>
                  ) : books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No books found in inventory.</TableCell>
                    </TableRow>
                  ) : (
                    books.map((book) => (
                      <TableRow key={book._id}>
                        <TableCell className="font-medium max-w-[200px] truncate" title={book.title}>{book.title}</TableCell>
                        <TableCell>{book.author}</TableCell>
                        <TableCell><Badge variant="outline">{book.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={book.isAvailable ? 'default' : 'secondary'} className={book.isAvailable ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none' : ''}>
                            {book.isAvailable ? 'Available' : 'Borrowed'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(book._id)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
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
