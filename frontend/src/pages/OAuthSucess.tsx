import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { login } from "../store/slice/authSlice";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const user: any = jwtDecode(token);
      dispatch(login({ user: { name: user.name, email: user.email }, token }));
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth" });
    }
  }, [dispatch, navigate]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;