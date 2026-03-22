import type { Book, CreateBookDto, UpdateBookDto } from '../types';
import { BookForm } from './BookForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../api';
import { toast } from 'sonner';

interface BookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Book; // if undefined, it's 'Create' mode
}

export function BookDialog({ open, onOpenChange, initialData }: BookDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const mutation = useMutation({
    mutationFn: (data: CreateBookDto | UpdateBookDto) => {
      // Cast down generically
      if (isEditing) {
        return booksApi.updateBook(initialData._id, data);
      } else {
        return booksApi.createBook(data as CreateBookDto);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(`Book successfully ${isEditing ? 'updated' : 'created'}!`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to save the book.');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to the book's details below." : "Enter the details of the new book to add to the library."}
          </DialogDescription>
        </DialogHeader>
        
        <BookForm 
          initialData={initialData} 
          onSubmit={(data) => mutation.mutate(data)} 
          isLoading={mutation.isPending} 
        />

      </DialogContent>
    </Dialog>
  );
}
