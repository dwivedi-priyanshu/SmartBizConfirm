import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThreeAnimation } from '@/components/landing/three-animation';

export default function Home() {
  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden">
      <ThreeAnimation />
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center p-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          receptio
        </h1>
        <p className="max-w-[700px] text-lg text-foreground/80 sm:text-xl">
          Streamlined Order & Invoice Management
        </p>
        <Button asChild size="lg">
          <Link href="/order">Start Order</Link>
        </Button>
      </div>
    </div>
  );
}
