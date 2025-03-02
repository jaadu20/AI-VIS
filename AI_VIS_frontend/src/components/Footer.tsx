import React from "react";

export function Footer() {
  return (
    <footer className="bg-transparent text-gray-300 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="mb-4 md:mb-0 text-lg">&copy; 2025 AI VIS. All rights reserved.</p>
        <div className="space-x-4 text-lg">
          <a href="#" className="hover:text-yellow-400">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-yellow-400">
            Terms of Service
          </a>
          <a href="#" className="hover:text-yellow-400">
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}
