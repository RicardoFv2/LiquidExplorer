import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAssetRegistry, handleApiError } from "../../services/esploraApi";

export default function RegisteredAssets() {
  const [assets, setAssets] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit] = useState(25);

  const fetchAssetRegistry = async (startIndex = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAssetRegistry({
        start_index: startIndex,
        limit: limit,
        sort_field: "ticker",
        sort_dir: "asc"
      });

      if (startIndex === 0) {
        setAssets(response.data);
      } else {
        setAssets(prev => [...prev, ...response.data]);
      }
      
      setTotalResults(response.headers["x-total-results"] || response.data.length); 
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error + ": " + errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetRegistry();
  }, []);

  const loadMoreAssets = () => {
    const nextStartIndex = assets.length;
    fetchAssetRegistry(nextStartIndex);
    setCurrentPage(prev => prev + 1);
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registered Assets</h1>
        <button 
          onClick={() => fetchAssetRegistry(0)} 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Assets</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchAssetRegistry(0)} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Showing {assets.length} of {totalResults} assets
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Domain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assets.map((asset, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/asset/${asset.asset_id}`} 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {asset.name || "Unnamed Asset"}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.ticker || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.domain || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/asset/${asset.asset_id}`} 
                          className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                        >
                          {asset.asset_id.slice(0, 16)}...
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {assets.map((asset, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow border">
                <div className="mb-3">
                  <Link 
                    to={`/asset/${asset.asset_id}`} 
                    className="text-lg font-bold text-blue-600 hover:text-blue-800"
                  >
                    {asset.name || "Unnamed Asset"}
                  </Link>
                  {asset.ticker && (
                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {asset.ticker}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  {asset.domain && (
                    <div>
                      <span className="font-medium text-gray-700">Domain: </span>
                      {asset.domain}
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium text-gray-700">Asset ID: </span>
                    <Link 
                      to={`/asset/${asset.asset_id}`} 
                      className="text-blue-600 hover:text-blue-800 font-mono break-all"
                    >
                      {asset.asset_id}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {assets.length < totalResults && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreAssets}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load More Assets"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
