import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { login } from "../store/slice/authSlice";

interface DecodedUser {
  name: string;
  email: string;
  _id?: string;
  provider?: string;
}

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      const user = jwtDecode<DecodedUser>(token);
      dispatch(login({ user, token }));
      // console.log(token)
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth" });
    }
  }, [dispatch, navigate]);

  return <div>Signing you in...</div>;
};

export default OAuthSuccess;
