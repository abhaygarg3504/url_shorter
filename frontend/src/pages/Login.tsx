import React, { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Link } from "react-router-dom";
import { loginUser } from "../api/user_api";
import { setUpOtp, verifyOtp, resetPassword } from "../api/forgot_api";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../store/slice/authSlice";

interface AuthProps {
  standalone?: boolean;
}

const Login:React.FC<AuthProps> = ({ standalone = true }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
 
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  console.log(auth)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data =  await loginUser(email, password);
      console.log(data);
     dispatch(login({ user: data.user, token: data.token })); 
      navigate({to: "/dashboard"})
    } catch {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async () => {
    setError(null);
    try {
      await setUpOtp(email);
      setOtpSent(true);
    } catch {
      setError("Failed to send OTP.");
    }
  };

 const handleOtpVerification = async () => {
  setError(null);
  try {
    await verifyOtp(email, otp);
    setOtpVerified(true);
    setError(null);        
    setSuccessMsg("OTP verified successfully.");
  } catch {
    setError("Invalid OTP.");
    setSuccessMsg("");     
  }
};


  const handlePasswordReset = async () => {
  setError(null);
  setSuccessMsg("")
  if (newPassword !== confirmPassword) {
    setError("Passwords do not match. Please enter the same password in both fields.");
    return;
  }

  try {
    await resetPassword(email, newPassword);
    setSuccessMsg("Password reset successfully! You can now login.");
    setShowForgot(false);
    setOtpSent(false);
    setOtpVerified(false);
    setNewPassword("");
    setConfirmPassword("");
  } catch {
    setError("Failed to reset password.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Sign In to Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email Address</label>
            <input id="email" type="email" className="w-full border border-gray-300 rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          {!showForgot && (
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
              <input id="password" type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Your password" />
            </div>
          )}
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}
          {successMsg && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{successMsg}</div>}
          {!showForgot ? (
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 rounded" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          ) : (
            <>
              {!otpSent && (
                <button type="button" className="w-full bg-blue-500 text-white py-2 rounded" onClick={handleOtpRequest}>Send OTP</button>
              )}
              {otpSent && !otpVerified && (
                <>
                  <input type="text" placeholder="Enter OTP" className="w-full mt-2 border px-3 py-2 rounded" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button type="button" className="w-full bg-green-500 text-white py-2 rounded mt-2" onClick={handleOtpVerification}>Verify OTP</button>
                </>
              )}
             {otpVerified && (
  <>
    <input
      type="password"
      placeholder="New Password"
      className="w-full mt-2 border px-3 py-2 rounded"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
    <input
      type="password"
      placeholder="Confirm New Password"
      className="w-full mt-2 border px-3 py-2 rounded"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />
    <button
      type="button"
      className="w-full bg-purple-500 text-white py-2 rounded mt-2"
      onClick={handlePasswordReset}
    >
      Reset Password
    </button>
  </>
)}
            </>
          )}
          <p className="text-blue-600 cursor-pointer" onClick={() => setShowForgot(prev => !prev)}>Forgot Password?</p>
          <GoogleLoginButton />
          {standalone && (
            <p className="text-center text-sm mt-4">
              Don’t have an account? <Link to="/auth" className="text-blue-600 hover:underline">Register</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
