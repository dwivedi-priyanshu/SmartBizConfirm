import Link from 'next/link';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              receptio
            </span>
          </Link>
        </div>
        
        <nav className="flex-1 flex items-center justify-center space-x-6 text-sm font-medium">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            href="/order"
            className="transition-colors hover:text-foreground/80 text-foreground"
          >
            New Order
          </Link>
        </nav>

        <div className="flex items-center justify-end">
          <Button asChild>
            <Link href="/order">Start Order</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
