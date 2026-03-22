import { createFileRoute } from '@tanstack/react-router';
import { BooksTable } from '@/features/books/components/BooksTable';
import { BookDialog } from '@/features/books/components/BookDialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Book } from '@/features/books/types';

export const Route = createFileRoute('/books')({
  component: BooksRoute,
});

function BooksRoute() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedBook(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Books Management</h1>
          <p className="text-muted-foreground mt-1">Manage library records, availability, and more.</p>
        </div>
        <Button onClick={handleCreate} size="lg">Add Book</Button>
      </div>

      <BooksTable onEdit={handleEdit} />

      <BookDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        initialData={selectedBook} 
      />
    </div>
  );
}
