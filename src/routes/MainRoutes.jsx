import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import RegisteredAssets from "../components/assetList/RegisteredAssets";
import AssetSearch from "../components/assetList/AssetSearch";

export default function MainRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="home">
            <button className="text-9xl text-center font-bold underline">
              <Link to="/registeredassets">Registered Assets List</Link>
            </button>
            
          </div>
        }
      />
      <Route path="/registeredassets" element={<RegisteredAssets />} />
      <Route path="/asset/:assetId" element={<AssetSearch />} />
    </Routes>
  );
}
