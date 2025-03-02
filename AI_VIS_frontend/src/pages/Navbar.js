import React from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="fixed w-full bg-black bg-opacity-60 py-4 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-yellow-300 tracking-wide">
          AI VIS
        </h1>
        <nav className="space-x-6 text-lg">
          <Link to="/" className="text-gray-200 hover:text-yellow-300">
            Home
          </Link>
          <Link to="/about" className="text-gray-200 hover:text-yellow-300">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-200 hover:text-yellow-300">
            Contact
          </Link>
        </nav>
        <button className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-500">
          Join Now
        </button>
      </div>
    </header>
  );
}
