import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import UrlForm from "../components/UrlForm";

const Dashboard = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="max-w-xl mx-auto mt-10">
      {isAuthenticated ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Welcome, {user?.name || "User"}!</h2>
          <UrlForm />
          {/* You can add your custom URL logic/component here */}
        </>
      ) : (
        <div className="text-center text-lg text-red-600">
          Please log in to access your dashboard.
        </div>
      )}
    </div>
  );
};

export default Dashboard;