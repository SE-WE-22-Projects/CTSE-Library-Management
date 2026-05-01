import { Outlet } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <Outlet />
        </div>
      </div>
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white dark:bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-primary/5 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold tracking-tight">CTSE Library</span>
        </div>
        
        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              "A modern, robust library management system built with microservices and a stunning user interface."
            </p>
            <footer className="text-sm text-zinc-400">Powered by Next-Gen Technologies</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
