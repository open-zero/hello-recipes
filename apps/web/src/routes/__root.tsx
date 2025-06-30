import { NotFoundPage } from '#src/components/NotFoundPage';
import { authClient } from '#src/features/auth/authClient';
import { theme } from '#src/theme/theme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import interCss from '@fontsource-variable/inter?url';
import loraCss from '@fontsource-variable/lora?url';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type {} from '@mui/material/themeCssVarsAugmentation';
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
import appCss from '../theme/theme.css?url';

interface RouterContext {
  queryClient: QueryClient;
  userId: string | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    const { data } = await authClient.getSession();

    return {
      userId: data?.user.id ?? null,
    };
  },
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
        { rel: 'stylesheet', href: appCss },
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
