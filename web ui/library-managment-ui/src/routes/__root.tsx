import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground antialiased">
      <header className="border-b">
        <div className="container mx-auto p-4 flex gap-4">
          <Link to="/" className="font-semibold px-3 py-2 rounded hover:bg-muted [&.active]:bg-primary [&.active]:text-primary-foreground">Home</Link>
          <Link to="/books" className="font-semibold px-3 py-2 rounded hover:bg-muted [&.active]:bg-primary [&.active]:text-primary-foreground">Books</Link>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
