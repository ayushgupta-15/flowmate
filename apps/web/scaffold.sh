#!/bin/bash
set -e

# Create directories
mkdir -p src/app/auth/login
mkdir -p src/app/dashboard
mkdir -p src/components/ui
mkdir -p src/lib

# layout.tsx
cat > src/app/layout.tsx << 'EOL'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlowMate - Collaborative Code Editor',
  description: 'Real-time collaborative coding with AI assistance',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOL

# home page
cat > src/app/page.tsx << 'EOL'
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold mb-6">FlowMate</h1>
      <p className="text-xl mb-10 text-gray-600">
        Real-time collaborative coding with AI assistance
      </p>
      <div className="flex gap-4">
        <Link href="/auth/login"><Button variant="outline">Log In</Button></Link>
        <Link href="/auth/register"><Button>Get Started</Button></Link>
      </div>
    </main>
  );
}
EOL

# login page
cat > src/app/auth/login/page.tsx << 'EOL'
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="space-y-4 w-full max-w-md">
        <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button className="w-full">Sign in</Button>
      </form>
    </div>
  );
}
EOL

# dashboard
cat > src/app/dashboard/page.tsx << 'EOL'
'use client';

export default function Dashboard() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold">Your Projects</h2>
    </div>
  );
}
EOL

# button
cat > src/components/ui/button.tsx << 'EOL'
import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white',
        outline: 'border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Button({ className, variant, ...props }: any) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
EOL

# input
cat > src/components/ui/input.tsx << 'EOL'
import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('border rounded px-3 py-2 w-full', className)} {...props} />
  )
);
Input.displayName = 'Input';
EOL

# utils
cat > src/lib/utils.ts << 'EOL'
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
EOL

echo "✅ FlowMate frontend scaffolded successfully"
