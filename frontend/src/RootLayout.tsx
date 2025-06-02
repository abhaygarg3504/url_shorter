import { Outlet } from '@tanstack/react-router';
import Navbar from './components/Navbar';

const RootLayout = () => {
  return (
    <div>
      <Navbar/>
      <Outlet />
    </div>
  );
};

export default RootLayout;
