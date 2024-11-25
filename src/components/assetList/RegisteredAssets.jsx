import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AssetRegistry() {
  const [assets, setAssets] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);

  const queryParams = {
    start_index: 0,
    limit: 10,
    sort_field: "ticker", 
    sort_dir: "asc",      
  };

  const fetchAssetRegistry = async () => {
    try {
      const response = await axios.get("https://blockstream.info/liquidtestnet/api/assets/registry", {
        params: queryParams, 
      });

      setAssets(response.data);
      setTotalResults(response.headers["x-total-results"]); 
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAssetRegistry();
  }, []);

  return (
    <div className="asset-registry">
      <h1 className="text-5xl font-bold text-center">Asset Registry</h1>
      {error ? (
        <p className="error">Failed to load assets: {error}</p>
      ) : (
        <>
          <p>Total Results: {totalResults}</p>
          <ul>
            {assets.map((asset, index) => (
              <li key={index}>
                <p><strong>Asset Name:</strong> {asset.name || "N/A"}</p>
                <p><strong>Ticker:</strong> {asset.ticker || "N/A"}</p>
                <p><strong>Domain:</strong> {asset.domain || "N/A"}</p>
                <p><strong>Asset ID:</strong> {asset.asset_id}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
