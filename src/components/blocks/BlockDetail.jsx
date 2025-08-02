import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlock, getBlockTxs, getBlockAtHeight, formatTimestamp, formatSatoshis, truncateHash, handleApiError } from "../../services/esploraApi";

export default function BlockDetail() {
  const { hash, height } = useParams();
  const [block, setBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [error, setError] = useState(null);
  const [showAllTxs, setShowAllTxs] = useState(false);
  const [txStartIndex, setTxStartIndex] = useState(0);

  useEffect(() => {
    fetchBlockData();
  }, [hash, height]);

  const fetchBlockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch block details - use height if provided, otherwise use hash
      let blockData;
      let blockHash;
      
      if (height) {
        // getBlockAtHeight returns just the hash string
        const hashResponse = await getBlockAtHeight(parseInt(height));
        blockHash = hashResponse.data;
        // Now get the full block data using the hash
        const blockResponse = await getBlock(blockHash);
        blockData = blockResponse.data;
      } else {
        blockHash = hash;
        const blockResponse = await getBlock(hash);
        blockData = blockResponse.data;
      }
      
      setBlock(blockData);
      
      // Fetch first batch of transactions
      await fetchTransactions(blockHash, 0, true);
      
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error + ": " + errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (blockHash, startIndex = 0, reset = false) => {
    try {
      setLoadingTxs(true);
      const txResponse = await getBlockTxs(blockHash, startIndex);
      
      if (reset) {
        setTransactions(txResponse.data);
      } else {
        setTransactions(prev => [...prev, ...txResponse.data]);
      }
      
      setTxStartIndex(startIndex + txResponse.data.length);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTxs(false);
    }
  };

  const loadMoreTransactions = () => {
    const blockHash = block?.id || hash;
    fetchTransactions(blockHash, txStartIndex, false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading block details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Block</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchBlockData} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Block not found</h2>
      </div>
    );
  }

  const blockFields = [
    { label: "Height", value: block.height, copyable: false },
    { label: "Hash", value: block.id, copyable: true },
    { label: "Previous Block", value: block.previousblockhash, copyable: true, linkTo: `/block/${block.previousblockhash}` },
    { label: "Next Block", value: block.nextblockhash, copyable: true, linkTo: block.nextblockhash ? `/block/${block.nextblockhash}` : null },
    { label: "Merkle Root", value: block.merkle_root, copyable: true },
    { label: "Timestamp", value: formatTimestamp(block.timestamp), copyable: false },
    { label: "Size", value: `${(block.size / 1024).toFixed(2)} KB (${block.size.toLocaleString()} bytes)`, copyable: false },
    { label: "Weight", value: `${(block.weight / 1000).toFixed(2)} KWU (${block.weight.toLocaleString()} weight units)`, copyable: false },
    { label: "Transaction Count", value: block.tx_count.toLocaleString(), copyable: false },
    { label: "Version", value: `0x${block.version.toString(16)} (${block.version})`, copyable: false },
    { label: "Bits", value: block.bits, copyable: true },
    { label: "Nonce", value: block.nonce.toLocaleString(), copyable: false },
    { label: "Difficulty", value: block.difficulty ? block.difficulty.toLocaleString() : "N/A", copyable: false }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You might want to add a toast notification here
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <Link to="/blocks" className="text-blue-600 hover:text-blue-800">← Back to Blocks</Link>
        </div>
        <h1 className="text-3xl font-bold">Block #{block.height}</h1>
        <p className="text-gray-600 font-mono text-sm break-all">{block.id}</p>
      </div>

      {/* Navigation between blocks */}
      <div className="flex justify-between mb-6">
        <div>
          {block.previousblockhash && (
            <Link 
              to={`/block/${block.previousblockhash}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              ← Previous Block
            </Link>
          )}
        </div>
        <div>
          {block.nextblockhash && (
            <Link 
              to={`/block/${block.nextblockhash}`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Next Block →
            </Link>
          )}
        </div>
      </div>

      {/* Block Details */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Block Details</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {blockFields.map((field, index) => (
              <div key={index} className="border-b border-gray-200 pb-2">
                <div className="text-sm font-medium text-gray-500 mb-1">{field.label}</div>
                <div className="flex items-center space-x-2">
                  {field.linkTo ? (
                    <Link 
                      to={field.linkTo}
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                    >
                      {field.value}
                    </Link>
                  ) : (
                    <span className={`text-sm ${field.copyable ? 'font-mono break-all' : ''}`}>
                      {field.value}
                    </span>
                  )}
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

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">
            Transactions ({block.tx_count})
          </h2>
        </div>
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center text-gray-500">Loading transactions...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inputs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outputs
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.txid} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link 
                            to={`/tx/${tx.txid}`} 
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                          >
                            {truncateHash(tx.txid, 16, 0)}
                          </Link>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.vin.length}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.vout.length}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tx.fee ? formatSatoshis(tx.fee, 2) : "0"} L-BTC
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(tx.size / 1024).toFixed(2)} KB
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.txid} className="border rounded-lg p-4">
                    <Link 
                      to={`/tx/${tx.txid}`} 
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm block mb-2 break-all"
                    >
                      {tx.txid}
                    </Link>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>In: {tx.vin.length} | Out: {tx.vout.length}</span>
                      <span>Fee: {tx.fee ? formatSatoshis(tx.fee, 2) : "0"} L-BTC</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {transactions.length < block.tx_count && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMoreTransactions}
                    disabled={loadingTxs}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingTxs ? "Loading..." : "Load More Transactions"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}