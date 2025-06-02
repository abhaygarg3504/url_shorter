
import React, { useState } from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Link } from "react-router-dom";
import { registerUser } from "../api/user_api";

interface AuthProps {
  standalone?: boolean;
}

const Register: React.FC<AuthProps> = ({ standalone = true }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerUser(name, email, password);
      console.log("Register success");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* form fields */}
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Name</label>
            <input id="name" type="text" className="w-full border border-gray-300 rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email Address</label>
            <input id="email" type="email" className="w-full border border-gray-300 rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
            <input id="password" type="password" className="w-full border border-gray-300 rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Create a password" />
          </div>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}
          <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <GoogleLoginButton />
          {standalone && (
            <p className="text-center text-sm mt-4">
              Already have an account? <Link to="/auth" className="text-green-600 hover:underline">Login</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;
