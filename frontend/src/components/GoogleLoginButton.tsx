import React from "react";

const GoogleLoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
   <button
      onClick={handleLogin}
      className="flex items-center justify-center w-full gap-3 bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg shadow hover:bg-gray-50 transition duration-200"
    >
      <svg className="w-5 h-5" viewBox="0 0 48 48">
        <g>
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.86-6.86C36.68 2.36 30.7 0 24 0 14.82 0 6.73 5.06 2.69 12.44l7.99 6.21C12.13 13.13 17.61 9.5 24 9.5z"/>
          <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.41c-.54 2.91-2.17 5.38-4.62 7.05l7.1 5.53C43.98 37.13 46.1 31.36 46.1 24.55z"/>
          <path fill="#FBBC05" d="M10.68 28.65c-1.09-3.22-1.09-6.68 0-9.9l-7.99-6.21C.98 16.36 0 20.06 0 24c0 3.94.98 7.64 2.69 11.46l7.99-6.21z"/>
          <path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.91-6.02l-7.1-5.53c-2.01 1.35-4.59 2.15-7.81 2.15-6.39 0-11.87-3.63-14.32-8.95l-7.99 6.21C6.73 42.94 14.82 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </g>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
};

export default GoogleLoginButton;