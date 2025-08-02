import React from "react";
import { Link } from "react-router-dom";
import UniversalSearch from "./components/common/UniversalSearch";
import MainRoutes from "./routes/MainRoutes";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600">⚡</div>
              <span className="text-xl font-bold text-gray-900">Liquid Explorer</span>
              <span className="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded">Testnet</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                to="/blocks" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Blocks
              </Link>
              <Link 
                to="/registeredassets" 
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Assets
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-gray-500 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-xl mx-auto">
            <UniversalSearch placeholder="Search blocks, transactions, addresses, assets..." />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <MainRoutes />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">Liquid Network Testnet Explorer</p>
            <p className="text-sm">Powered by Esplora API</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
