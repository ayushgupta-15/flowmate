import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { UserNav } from '@/components/dashboard/user-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">FlowMate</h1>
              <DashboardNav />
            </div>
            <UserNav />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
