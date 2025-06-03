import { Route } from '@tanstack/react-router';
import { rootRoute } from './routingTree';
import OAuthSuccess from '../pages/OAuthSucess';

export const oauthSuccessRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/oauth-success',
  component: OAuthSuccess,
});