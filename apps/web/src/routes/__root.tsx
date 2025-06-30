import { NotFoundPage } from '#src/components/NotFoundPage';
import { theme } from '#src/theme/theme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import interCss from '@fontsource-variable/inter?url';
import loraCss from '@fontsource-variable/lora?url';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { SnackbarProvider } from 'notistack';
import type { ReactNode } from 'react';
import '../theme/theme.css';

interface RouterContext {
  queryClient: QueryClient;
  userId: string | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  head: () => {
    return {
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'TanStack Start Starter',
        },
      ],
      links: [
        { rel: 'stylesheet', href: interCss },
        { rel: 'stylesheet', href: loraCss },
        {
          rel: 'icon',
          href: '/assets/lil-guy.svg',
        },
        {
          rel: 'preconnect',
          href: 'https://api.hellorecipes.com',
        },
      ],
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const emotionCache = createCache({ key: 'css' });

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme} forceThemeRerender>
        <CssBaseline />
        <SnackbarProvider>{children}</SnackbarProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>{children}</Providers>
        <ReactQueryDevtools buttonPosition="top-right" />
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
