import { Link } from '@tanstack/react-router';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="text-white text-2xl font-bold tracking-wide"
            preload="intent"
          >
            Url Shortener
          </Link>
          <div>
            <Link
              to="/auth"
              className="ml-4 px-5 py-2 bg-white text-blue-700 font-semibold rounded-full shadow hover:bg-blue-50 transition duration-200"
            >
              Logout
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
