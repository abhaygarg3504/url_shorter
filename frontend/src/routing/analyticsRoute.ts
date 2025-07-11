// src/routing/analyticsRoute.ts
import { Route } from '@tanstack/react-router';
import { rootRoute } from './routingTree';
import { checkAuth } from '../utils/helper';
import Analytics from '../pages/Analytics';

export const analyticsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: Analytics,
  loader: checkAuth,
});
