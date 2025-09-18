"use client";

import Link from 'next/link';
import { Package2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/order', label: 'New Order' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/70 bg-background/90">
      <div className="border-b bg-gradient-to-r from-primary/10 via-transparent to-primary/10">
        <div className="container px-6 md:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/30">
                <Package2 className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
              </span>
              <span className="font-bold tracking-tight">Receptio</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-2 text-sm font-medium">
            {links.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${isActive ? 'text-foreground' : 'text-foreground/60'} relative rounded-full px-4 py-2 transition-all hover:text-foreground hover:bg-primary/10 ring-1 ring-transparent hover:ring-primary/20`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-full bg-primary/10 ring-1 ring-primary/20" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button className="hidden sm:inline-flex" asChild>
              <Link href="/order">Start Order</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-6 grid gap-3">
                  {links.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-md px-3 py-2 text-sm transition-colors ${pathname === link.href ? 'bg-primary/10 text-foreground' : 'text-foreground/70 hover:text-foreground hover:bg-primary/10'}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button asChild>
                    <Link href="/order">Start Order</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
