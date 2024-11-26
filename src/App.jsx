import React from "react";
import SearchBar from "./components/assetList/AssetSearchBar";
import MainRoutes from "./routes/MainRoutes";
export default function App() {
  return (
    <div className="app">
      <SearchBar />
      <MainRoutes />
    </div>
  );
}
