// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./slice/authSlice";
import analyticsReducer from "./slice/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    analytics: analyticsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;