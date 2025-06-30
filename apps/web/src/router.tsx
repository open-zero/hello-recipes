import { updateApiOptions } from '@open-zero/features';
import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routerWithQueryClient } from '@tanstack/react-router-with-query';
import { HTTPError } from 'ky';
import { NotFoundPage } from './components/NotFoundPage';
import { config } from './config/config';
import { routeTree } from './routeTree.gen';

// NOTE: Most of the integration code found here is experimental and will
// definitely end up in a more streamlined API in the future. This is just
// to show what's possible with the current APIs.

export function createRouter() {
  updateApiOptions({
    prefixUrl: config.VITE_API_URL,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof HTTPError && error.response.status === 403) {
            return false;
          }

          return failureCount < 3;
        },
      },
    },
  });

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: 'intent',
      defaultNotFoundComponent: () => <NotFoundPage />,
    }),
    queryClient,
  );
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
