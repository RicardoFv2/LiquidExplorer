import React from "react";
import { Route, Routes, Link } from "react-router-dom";
import AssetsList from "./components/assetList/AssetsList";
import RegisteredAssets from "./components/assetList/RegisteredAssets";

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <div className="home">
              <button className="text-9xl text-center font-bold underline">
                <Link to="/registeredassets">Registered Assets List</Link>
              </button>
              <button className="text-9xl text-center font-bold underline">
                <Link to="/assets">Assets List</Link>
              </button>
            </div>
          }
        />
        <Route path="/assets" element={<AssetsList />} />
        <Route path="/registeredassets" element={<RegisteredAssets />} />
      </Routes>
    </div>
  );
}
