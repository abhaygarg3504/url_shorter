import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../api/user_api";
import { login } from "../store/slice/authSlice";

export const checkAuth = async ({ context }: { context: any }) => {
  try {
    const { queryClient, store } = context;

    const user = await queryClient.ensureQueryData({
      queryKey: ['currentUser'],
      queryFn: getCurrentUser,
    });

    if (!user) return false;

    store.dispatch(login(user));

    const isAuthenticated = store.getState().auth.isAuthenticated;
    if (!isAuthenticated) return false;

    return true;
  } catch (error) {
    console.log("Auth error:", error);
    throw redirect({ to: "/auth" });
  }
};

