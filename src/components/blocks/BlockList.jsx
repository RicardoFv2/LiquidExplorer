import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getLatestBlocks, formatTimestamp, truncateHash, handleApiError } from "../../services/esploraApi";

export default function BlockList() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startHeight, setStartHeight] = useState(null);

  const fetchBlocks = async (height = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLatestBlocks(height);
      
      if (height) {
        // If loading more, append to existing blocks
        setBlocks(prev => [...prev, ...response.data]);
      } else {
        // If initial load, replace blocks
        setBlocks(response.data);
      }
      
      // Set start height for next load
      if (response.data.length > 0) {
        const lastBlock = response.data[response.data.length - 1];
        setStartHeight(lastBlock.height - 1);
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error + ": " + errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  const loadMoreBlocks = () => {
    if (startHeight !== null) {
      fetchBlocks(startHeight);
    }
  };

  if (loading && blocks.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading blocks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blocks</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => fetchBlocks()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Latest Blocks</h1>
        <button 
          onClick={() => fetchBlocks()} 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Height
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {blocks.map((block) => (
                <tr key={block.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/block/${block.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {block.height}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/block/${block.id}`} 
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                    >
                      {truncateHash(block.id, 12, 12)}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTimestamp(block.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {block.tx_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(block.size / 1024).toFixed(2)} KB
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(block.weight / 1000).toFixed(2)} KWU
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start mb-2">
              <Link 
                to={`/block/${block.id}`} 
                className="text-lg font-bold text-blue-600 hover:text-blue-800"
              >
                Block #{block.height}
              </Link>
              <span className="text-sm text-gray-500">
                {new Date(block.timestamp * 1000).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Hash: </span>
                <Link 
                  to={`/block/${block.id}`} 
                  className="text-blue-600 hover:text-blue-800 font-mono break-all"
                >
                  {block.id}
                </Link>
              </div>
              
              <div className="flex justify-between">
                <span><span className="font-medium text-gray-700">Txs:</span> {block.tx_count}</span>
                <span><span className="font-medium text-gray-700">Size:</span> {(block.size / 1024).toFixed(2)} KB</span>
              </div>
              
              <div className="text-gray-600">
                {formatTimestamp(block.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={loadMoreBlocks}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load More Blocks"}
        </button>
      </div>
    </div>
  );
}