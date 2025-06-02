import { Route } from '@tanstack/react-router';
import { rootRoute } from './routingTree';
import Dashboard from '../pages/Dashboard';
import { checkAuth } from '../utils/helper';

export const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  loader: checkAuth,
});
