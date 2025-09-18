import Link from 'next/link';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex flex-1 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">
              SmartBiz Confirm
            </span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
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
        </div>
        <div className="flex items-center justify-end space-x-4">
          <Button asChild>
            <Link href="/order">Start Order</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
