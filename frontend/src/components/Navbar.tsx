import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
 const Navbar = () => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <nav>
      {isAuthenticated ? (
        <div>Welcome, {user.name}</div>
      ) : (
        <button>Login</button>
      )}
    </nav>
  );
};

export default Navbar