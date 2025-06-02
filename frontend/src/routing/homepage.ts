import { Route } from '@tanstack/react-router';
import { rootRoute } from './routingTree';
import HomePage from '../pages/HomePage';

export const homepageRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});
