import { createRootRoute, createRouter } from '@tanstack/react-router';
import { homepageRoute } from './homepage';
import { authRoute } from './authRoute';
import { dashboardRoute } from './dashboard';
import RootLayout from '../RootLayout';
import { QueryClient } from '@tanstack/react-query';
import { store } from '../store/store';
import { oauthSuccessRoute } from './oauthSucess';

export const rootRoute = createRootRoute({
  component: RootLayout,
});
const queryClient = new QueryClient();
export const routeTree = rootRoute.addChildren([
  homepageRoute,
  authRoute,
  dashboardRoute,
  oauthSuccessRoute
]);

export const router = createRouter({ routeTree, 
  context:{
    queryClient, store
  }
 });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
