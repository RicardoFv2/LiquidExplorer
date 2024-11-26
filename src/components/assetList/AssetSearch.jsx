import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function AssetSearch() {
  const { assetId } = useParams();
  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        const response = await axios.get(
          `https://blockstream.info/liquidtestnet/api/asset/${assetId}`
        );
        setAssetData(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAssetDetails();
  }, [assetId]);


  const fields = [
    { label: "Asset ID", value: assetId },
    { label: "Name", value: assetData?.name || "N/A" },
    { label: "Ticker", value: assetData?.ticker || "N/A" },
    { label: "Domain", value: assetData?.domain || "N/A" },
    {
      label: "Chain Stats",
      value: assetData?.chain_stats
        ? JSON.stringify(assetData.chain_stats, null, 2)
        : "N/A",
    },
    {
      label: "Mempool Stats",
      value: assetData?.mempool_stats
        ? JSON.stringify(assetData.mempool_stats, null, 2)
        : "N/A",
    },
    assetData?.contract && {
      label: "Contract",
      value: JSON.stringify(assetData.contract, null, 2),
    },
    assetData?.entity?.domain && {
      label: "Entity Domain",
      value: assetData.entity.domain,
    },
  ].filter(Boolean); 

  return (
    <div className="p-8">
      <h1 className="text-5xl font-bold text-center mb-6">Asset Details</h1>
      {error ? (
        <p className="text-red-500 text-center">Failed to fetch asset: {error}</p>
      ) : assetData ? (
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2">Field</th>
                <th className="border border-gray-300 p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{field.label}</td>
                  <td className="border border-gray-300 p-2">
                    <pre className="whitespace-pre-wrap">{field.value}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center">Loading...</p>
      )}
    </div>
  );
}
