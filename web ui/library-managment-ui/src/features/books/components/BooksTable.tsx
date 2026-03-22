import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Book } from '../types';

interface BooksTableProps {
  onEdit: (book: Book) => void;
}

export function BooksTable({ onEdit }: BooksTableProps) {
  const queryClient = useQueryClient();

  const { data: books, isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksApi.getBooks(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => booksApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  if (isLoading) return <div className="p-4 text-center">Loading books...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Failed to load books.</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            books?.map((book) => (
              <TableRow key={book._id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>${book.price}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {book.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(book)}>
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this book?')) {
                        deleteMutation.mutate(book._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
