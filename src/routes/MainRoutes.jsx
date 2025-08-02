import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import RegisteredAssets from "../components/assetList/RegisteredAssets";
import AssetSearch from "../components/assetList/AssetSearch";
import BlockList from "../components/blocks/BlockList";
import BlockDetail from "../components/blocks/BlockDetail";
import TransactionDetail from "../components/transactions/TransactionDetail";
import AddressDetail from "../components/addresses/AddressDetail";

export default function MainRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="home p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-6xl font-bold text-center mb-8 text-gray-800">
                Liquid Explorer
              </h1>
              <p className="text-xl text-center text-gray-600 mb-12">
                Explore the Liquid Network testnet - blocks, transactions, addresses, and assets
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link 
                  to="/blocks" 
                  className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">🧱</div>
                  <div className="text-xl font-semibold">Blocks</div>
                  <div className="text-sm opacity-90">Latest blocks</div>
                </Link>
                
                <Link 
                  to="/registeredassets" 
                  className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center transition-colors"
                >
                  <div className="text-3xl mb-2">💎</div>
                  <div className="text-xl font-semibold">Assets</div>
                  <div className="text-sm opacity-90">Registered assets</div>
                </Link>
                
                <div className="bg-purple-500 text-white p-6 rounded-lg text-center">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-xl font-semibold">Search</div>
                  <div className="text-sm opacity-90">Use search above</div>
                </div>
                
                <div className="bg-orange-500 text-white p-6 rounded-lg text-center">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-xl font-semibold">Testnet</div>
                  <div className="text-sm opacity-90">Liquid testnet</div>
                </div>
              </div>
              
              <div className="mt-12 text-center text-gray-600">
                <p className="mb-4">Search for blocks, transactions, addresses, or assets using the search bar above.</p>
                <div className="text-sm">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span> for block height • 
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">VJL...</span> for address • 
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">abc123...</span> for transaction
                </div>
              </div>
            </div>
          </div>
        }
      />
      
      {/* Block routes */}
      <Route path="/blocks" element={<BlockList />} />
      <Route path="/block/:hash" element={<BlockDetail />} />
      <Route path="/block-height/:height" element={<BlockDetail />} />
      
      {/* Transaction routes */}
      <Route path="/tx/:txid" element={<TransactionDetail />} />
      
      {/* Address routes */}
      <Route path="/address/:address" element={<AddressDetail />} />
      
      {/* Asset routes */}
      <Route path="/registeredassets" element={<RegisteredAssets />} />
      <Route path="/asset/:assetId" element={<AssetSearch />} />
    </Routes>
  );
}
