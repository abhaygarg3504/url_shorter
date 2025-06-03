import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../store/slice/authSlice";

const OauthRedirectHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        dispatch(login({ token, user }));
        navigate("/dashboard"); // or wherever you want
      } catch (error) {
        console.error("Failed to parse user info from URL", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [dispatch, navigate, searchParams]);

  return <div>Logging in with Google...</div>;
};

export default OauthRedirectHandler;
