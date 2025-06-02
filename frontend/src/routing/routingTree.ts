import { createRootRoute, createRouter } from '@tanstack/react-router';
import { homepageRoute } from './homepage';
import { authRoute } from './authRoute';
import { dashboardRoute } from './dashboard';
import RootLayout from '../RootLayout';

export const rootRoute = createRootRoute({
  component: RootLayout,
});

export const routeTree = rootRoute.addChildren([
  homepageRoute,
  authRoute,
  dashboardRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
