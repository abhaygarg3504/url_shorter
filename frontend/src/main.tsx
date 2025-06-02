import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routing/routingTree';
import { Provider } from 'react-redux';
import { store } from './store/store';
createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
      <RouterProvider router={router} />
     </Provider>
  </StrictMode>
);
