export interface Book {
  _id: string; // From Mongoose
  title: string;
  author: string;
  description?: string;
  price: number;
  category: string;
  publishedDate?: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  description?: string;
  price: number;
  category: string;
  publishedDate?: string;
  isAvailable?: boolean;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}
