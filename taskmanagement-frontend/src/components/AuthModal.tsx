// src/components/AuthModal.tsx
import React, { useState } from "react";
import { signupUser, loginUser } from "../api/auth";

interface AuthModalProps {
  onClose: () => void;
  onAuthSuccess: (token: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const res = await loginUser({ email, password });

        const token = res.data.token;
        //const role = res.data.role; // ⭐ NEW

        localStorage.setItem("token", token);
        //localStorage.setItem("role", role); // ⭐ NEW

        onAuthSuccess(token);
      } else {
        await signupUser({ name, email, password });

        const res = await loginUser({ email, password });

        const token = res.data.token;
        const role = res.data.role; // ⭐ NEW

        localStorage.setItem("token", token);
        localStorage.setItem("role", role); // ⭐ NEW

        onAuthSuccess(token);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Signup"}
        </h2>

        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-4">
          {isLogin ? "New user?" : "Already have an account?"}{" "}
          <button
            className="text-blue-600 font-semibold hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;


