// // src/utils/helper.ts
// import { redirect } from "@tanstack/react-router";
// import { getCurrentUser } from "../api/user_api";
// import { login } from "../store/slice/authSlice";

// export const checkAuth = async ({ context }: { context: any }) => {
//   try {
//     const { queryClient, store } = context;

//     const user = await queryClient.ensureQueryData({
//       queryKey: ['currentUser'],
//       queryFn: getCurrentUser,
//     });

//     if (!user) return false;

//     store.dispatch(login(user));

//     const isAuthenticated = store.getState().auth.isAuthenticated;
//     if (!isAuthenticated) return false;

//     return true;
//   } catch (error) {
//     console.log("Auth error:", error);
//     throw redirect({ to: "/auth" });
//   }
// };

// src/utils/helper.ts
import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../api/user_api";
import { login, logout } from "../store/slice/authSlice";

export const checkAuth = async ({ context }: { context: any }) => {
  try {
    const { queryClient, store } = context;

    // Check if already authenticated
    const currentAuthState = store.getState().auth;
    if (currentAuthState.isAuthenticated && currentAuthState.user) {
      return true;
    }

    // Try to get current user
    const userData = await queryClient.ensureQueryData({
      queryKey: ['currentUser'],
      queryFn: getCurrentUser,
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      retry: false, // Don't retry on failure
    });

    if (!userData || !userData.user) {
      store.dispatch(logout());
      throw redirect({ to: "/auth" });
    }

    // Update auth state
    store.dispatch(login({
      user: userData.user,
      token: userData.token || currentAuthState.token || ''
    }));

    return true;
  } catch (error) {
    console.log("Auth check failed:", error);
    // store.dispatch(logout());
    throw redirect({ to: "/auth" });
  }
};
