"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ButtonUI from "@/components/ui/shadcn/button";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "letmein") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background-base flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-20 p-32 shadow-lg max-w-md w-full mx-16"
      >
        <div className="text-center mb-24">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Access Required
          </h1>
          <p className="text-gray-600">
            Please enter the password to access this application.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-16">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-16 py-12 border border-gray-300 rounded-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm mt-8"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <ButtonUI
            type="submit"
            className="w-full"
            variant="primary"
          >
            Access Application
          </ButtonUI>
        </form>
      </motion.div>
    </div>
  );
}
