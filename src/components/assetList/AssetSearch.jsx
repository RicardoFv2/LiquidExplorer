import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getAsset, handleApiError } from "../../services/esploraApi";

export default function AssetSearch() {
  const { assetId } = useParams();
  const [assetData, setAssetData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAsset(assetId);
        setAssetData(response.data);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.error + ": " + errorInfo.details);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [assetId]);


    const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading asset details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Asset</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!assetData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Asset not found</h2>
      </div>
    );
  }

  const fields = [
    { label: "Asset ID", value: assetId, copyable: true },
    { label: "Name", value: assetData?.name || "N/A", copyable: false },
    { label: "Ticker", value: assetData?.ticker || "N/A", copyable: false },
    { label: "Domain", value: assetData?.domain || "N/A", copyable: false },
    { label: "Precision", value: assetData?.precision || "N/A", copyable: false },
    { label: "Entity Domain", value: assetData?.entity?.domain || "N/A", copyable: false }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <Link to="/registeredassets" className="text-blue-600 hover:text-blue-800">← Back to Assets</Link>
        </div>
        <h1 className="text-3xl font-bold">
          {assetData?.name || "Unnamed Asset"}
          {assetData?.ticker && (
            <span className="ml-3 text-base bg-blue-100 text-blue-800 px-3 py-1 rounded">
              {assetData.ticker}
            </span>
          )}
        </h1>
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-gray-600 font-mono text-sm break-all">{assetId}</span>
          <button
            onClick={() => copyToClipboard(assetId)}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {/* Asset Details */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Asset Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {fields.map((field, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <div className="text-sm font-medium text-gray-500 mb-1">{field.label}</div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${field.copyable ? 'font-mono break-all' : ''}`}>
                    {field.value}
                  </span>
                  {field.copyable && (
                    <button
                      onClick={() => copyToClipboard(field.value)}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chain Stats */}
        {assetData?.chain_stats && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Chain Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Count:</span>
                  <span className="font-medium">{assetData.chain_stats.tx_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Funded TXO Count:</span>
                  <span className="font-medium">{assetData.chain_stats.funded_txo_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent TXO Count:</span>
                  <span className="font-medium">{assetData.chain_stats.spent_txo_count?.toLocaleString() || 0}</span>
                </div>
                {assetData.chain_stats.funded_txo_sum !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Funded:</span>
                    <span className="font-medium">{(assetData.chain_stats.funded_txo_sum / 100000000).toFixed(8)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mempool Stats */}
        {assetData?.mempool_stats && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold">Mempool Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Count:</span>
                  <span className="font-medium">{assetData.mempool_stats.tx_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Funded TXO Count:</span>
                  <span className="font-medium">{assetData.mempool_stats.funded_txo_count?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent TXO Count:</span>
                  <span className="font-medium">{assetData.mempool_stats.spent_txo_count?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contract Information */}
      {assetData?.contract && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold">Contract Information</h3>
          </div>
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(assetData.contract, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
