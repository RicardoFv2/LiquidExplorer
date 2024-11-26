import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [assetId, setAssetId] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (assetId.trim()) {
      navigate(`/asset/${assetId}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar p-4 flex justify-center items-center">
      <input
        type="text"
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
        placeholder="Enter Asset ID"
        className="border p-2 rounded w-1/3"
      />
      <button type="submit" className="p-2 bg-blue-500 text-white rounded ml-2">
        Search
      </button>
    </form>
  );
}
