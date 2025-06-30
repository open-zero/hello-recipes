import { RouterLink } from '#src/components/RouterLink';
import { Sidebar } from '#src/features/layout/Sidebar';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  useColorScheme,
  useMediaQuery,
  type Theme,
} from '@mui/material';
import {
  getSignedInUserQueryOptions,
  useSignedInUser,
} from '@open-zero/features/users';
import { useQueryClient } from '@tanstack/react-query';
import {
  getRouteApi,
  Navigate,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { authClient } from '../auth/authClient';
import { NewButton } from './NewButton';

const route = getRouteApi('/app/_auth');

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('md'),
  );
  const { data: session, isPending, error } = authClient.useSession();
  const router = useRouter();
  const routeContext = route.useRouteContext();
  const queryClient = useQueryClient();
  const { data: user } = useSignedInUser();
  const { setMode } = useColorScheme();

  useEffect(() => {
    if (user?.themePreference) {
      setMode(user.themePreference);
    }
  }, [user?.themePreference, setMode]);

  useEffect(() => {
    if (!isPending && error) {
      if (!routeContext.userId) {
        console.log('Invalidate');

        void router.invalidate();
        void queryClient.invalidateQueries({
          queryKey: getSignedInUserQueryOptions().queryKey,
        });
      }
    }
  }, [isPending, error, router, queryClient, routeContext.userId]);

  if (!isPending && !error && !session) {
    return <Navigate to="/sign-in" />;
  }

  // if (!routeContext.userId) {
  //   return null;
  // }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        isSmallScreen={isSmallScreen}
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
        }}
      />
      <Box component="main" width={'100%'}>
        {isSmallScreen && (
          <AppBar
            position="static"
            elevation={0}
            sx={{
              backgroundColor: (theme) => theme.vars.palette.background.default,
              color: (theme) => theme.vars.palette.text.primary,
            }}
          >
            <Toolbar
              sx={{
                backgroundColor: (theme) =>
                  theme.vars.palette.background.default,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open sidebar"
                  edge="start"
                  onClick={() => {
                    setSidebarOpen(!sidebarOpen);
                  }}
                  sx={{ mr: 1 }}
                >
                  <MenuRoundedIcon />
                </IconButton>
                <RouterLink
                  to="/app/recipes"
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <img src="/assets/lil-guy.svg" width={24} height={24} />
                </RouterLink>
              </Box>
              <NewButton
                slotProps={{
                  button: {
                    size: 'small',
                  },
                }}
              />
            </Toolbar>
          </AppBar>
        )}
        <Outlet />
      </Box>
    </Box>
  );
}
