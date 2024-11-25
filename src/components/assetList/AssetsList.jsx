import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AssetsList() {
  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState(null);
  const assetId =
    "5a9719f9db33d198ed485a750b8e72ef145ec5fe2c925d0f04118498e6c51cba"; 

  const fetchAssetData = async () => {
    try {
      const response = await axios.get(
        `https://blockstream.info/liquidtestnet/api/asset/${assetId}`
      );
      setAssetData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, []);

  return (
    <div className="app">
      <h1 className="text-9xl text-center font-bold underline">Hello World!</h1>

      <div className="transactions">
        <p>Tus tokens:</p>
        {error ? (
          <p className="error">Failed to load data: {error}</p>
        ) : assetData ? (
          <pre className="data">{JSON.stringify(assetData, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
