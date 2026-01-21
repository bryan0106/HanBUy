'use client';

import { useEffect, useState } from 'react';

/**
 * MSW Provider - Initializes Mock Service Worker in development
 * This component should only be used in development mode
 */
export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    // Only initialize MSW if explicitly enabled via environment variable
    if (
      typeof window !== 'undefined' &&
      process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
    ) {
      // Dynamically import and start MSW worker
      import('@/mocks/browser')
        .then(({ worker }) => {
          return worker.start({
            onUnhandledRequest: 'bypass', // Don't fail on unhandled requests
            serviceWorker: {
              // Use a relative path for the service worker
              url: '/mockServiceWorker.js',
            },
          });
        })
        .then(() => {
          console.log('✅ MSW (Mock Service Worker) started successfully');
          console.log('🎭 Payment API calls will be mocked');
          setMswReady(true);
        })
        .catch((error) => {
          console.error('❌ Failed to start MSW:', error);
          console.log('💡 Make sure to run: npx msw init public/');
          setMswReady(true); // Still render app even if MSW fails
        });
    } else {
      // Not in browser or not in development
      setMswReady(true);
    }
  }, []);

  // Show loading state only if MSW is initializing
  if (!mswReady) {
    return null; // Or return a loading indicator if needed
  }

  return <>{children}</>;
}

