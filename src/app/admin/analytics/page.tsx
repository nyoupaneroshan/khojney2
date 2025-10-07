// src/app/admin/analytics/page.tsx
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AnalyticsContent from './analytics-content';

// Loading fallback component
function AnalyticsLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
    </main>
  );
}

// Main page component
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <AnalyticsContent />
    </Suspense>
  );
}
