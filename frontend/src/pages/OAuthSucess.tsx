import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { login } from "../store/slice/authSlice";
import type {RootState} from "../store/store"; 

interface DecodedUser {
  name: string;
  email: string;
  _id?: string;
  provider?: string;
}

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const user = jwtDecode<DecodedUser>(token);
      dispatch(login({ user, token }));
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth" });
    }
  }, [dispatch, navigate]);

  // ✅ Log auth state when it updates
  useEffect(() => {
    if (auth.isAuthenticated) {
      // console.log("User authenticated via Google OAuth:", auth);
    }
  }, [auth]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;
