import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTransaction, formatTimestamp, formatSatoshis, truncateHash, handleApiError } from "../../services/esploraApi";

export default function TransactionDetail() {
  const { txid } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [txid]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTransaction(txid);
      setTransaction(response.data);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error + ": " + errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading transaction...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Transaction</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchTransaction} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Transaction not found</h2>
      </div>
    );
  }

  // Calculate total input and output values
  const totalInputValue = transaction.vin?.reduce((sum, input) => {
    return sum + (input.prevout?.value || 0);
  }, 0) || 0;

  const totalOutputValue = transaction.vout?.reduce((sum, output) => {
    return sum + (output.value || 0);
  }, 0) || 0;

  const txFields = [
    { label: "Transaction ID", value: transaction.txid, copyable: true },
    { label: "Status", value: transaction.status?.confirmed ? "Confirmed" : "Unconfirmed", copyable: false },
    { label: "Block Height", value: transaction.status?.block_height || "Unconfirmed", copyable: false, linkTo: transaction.status?.block_height ? `/block/${transaction.status.block_hash}` : null },
    { label: "Block Hash", value: transaction.status?.block_hash || "N/A", copyable: true, linkTo: transaction.status?.block_hash ? `/block/${transaction.status.block_hash}` : null },
    { label: "Timestamp", value: transaction.status?.block_time ? formatTimestamp(transaction.status.block_time) : "Unconfirmed", copyable: false },
    { label: "Size", value: `${(transaction.size / 1024).toFixed(2)} KB (${transaction.size} bytes)`, copyable: false },
    { label: "Virtual Size", value: `${(transaction.vsize / 1024).toFixed(2)} KB (${transaction.vsize} vbytes)`, copyable: false },
    { label: "Weight", value: `${(transaction.weight / 1000).toFixed(2)} KWU (${transaction.weight} weight units)`, copyable: false },
    { label: "Fee", value: transaction.fee ? `${formatSatoshis(transaction.fee)} L-BTC` : "0", copyable: false },
    { label: "Fee Rate", value: transaction.fee ? `${(transaction.fee / transaction.vsize).toFixed(2)} sat/vB` : "0", copyable: false },
    { label: "Version", value: transaction.version, copyable: false },
    { label: "Lock Time", value: transaction.locktime, copyable: false }
  ];

  const renderAssetInfo = (asset) => {
    if (!asset) return "L-BTC";
    if (typeof asset === 'string') return asset === "6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d" ? "L-BTC" : truncateHash(asset);
    return asset.asset_id === "6f0279e9ed041c3d710a9f57d0c02928416460c4b722ae3457a11eec381c526d" ? "L-BTC" : (asset.name || truncateHash(asset.asset_id));
  };

  const renderValue = (output) => {
    if (output.valuecommitment) {
      return (
        <span className="text-gray-500 italic">
          Confidential
          {output.value && <span className="ml-2">({formatSatoshis(output.value)} {renderAssetInfo(output.asset)})</span>}
        </span>
      );
    }
    return `${formatSatoshis(output.value || 0)} ${renderAssetInfo(output.asset)}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-mono text-sm break-all">{transaction.txid}</span>
          <button
            onClick={() => copyToClipboard(transaction.txid)}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Transaction Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {txFields.map((field, index) => (
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

      {/* Inputs and Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Inputs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-green-600">
              Inputs ({transaction.vin?.length || 0})
            </h3>
            {totalInputValue > 0 && (
              <p className="text-sm text-gray-600">
                Total: {formatSatoshis(totalInputValue)} L-BTC
              </p>
            )}
          </div>
          <div className="p-6 space-y-4">
            {transaction.vin?.map((input, index) => (
              <div key={index} className="border rounded-lg p-4 bg-green-50">
                {input.is_coinbase ? (
                  <div>
                    <div className="font-medium text-green-700">Coinbase (New Coins)</div>
                    <div className="text-sm text-gray-600 font-mono break-all">
                      {input.coinbase}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Previous Output:</div>
                    <Link 
                      to={`/tx/${input.txid}`}
                      className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                    >
                      {input.txid}:{input.vout}
                    </Link>
                    {input.prevout && (
                      <div className="mt-2 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Value: </span>
                          {renderValue(input.prevout)}
                        </div>
                        {input.prevout.scriptpubkey_address && (
                          <div className="text-sm">
                            <span className="font-medium">Address: </span>
                            <Link 
                              to={`/address/${input.prevout.scriptpubkey_address}`}
                              className="text-blue-600 hover:text-blue-800 font-mono"
                            >
                              {truncateHash(input.prevout.scriptpubkey_address, 12, 12)}
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )) || <div className="text-gray-500">No inputs</div>}
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-red-600">
              Outputs ({transaction.vout?.length || 0})
            </h3>
            {totalOutputValue > 0 && (
              <p className="text-sm text-gray-600">
                Total: {formatSatoshis(totalOutputValue)} L-BTC
              </p>
            )}
          </div>
          <div className="p-6 space-y-4">
            {transaction.vout?.map((output, index) => (
              <div key={index} className="border rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-red-700">Output #{index}</span>
                  <span className="text-sm font-medium">
                    {renderValue(output)}
                  </span>
                </div>
                
                {output.scriptpubkey_address && (
                  <div className="text-sm mb-2">
                    <span className="font-medium">Address: </span>
                    <Link 
                      to={`/address/${output.scriptpubkey_address}`}
                      className="text-blue-600 hover:text-blue-800 font-mono"
                    >
                      {output.scriptpubkey_address}
                    </Link>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Script Type: </span>
                  {output.scriptpubkey_type || "unknown"}
                </div>

                {/* Liquid-specific features */}
                {output.assetcommitment && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Asset Commitment: </span>
                    <span className="font-mono break-all">{output.assetcommitment}</span>
                  </div>
                )}
                
                {output.valuecommitment && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Value Commitment: </span>
                    <span className="font-mono break-all">{output.valuecommitment}</span>
                  </div>
                )}
              </div>
            )) || <div className="text-gray-500">No outputs</div>}
          </div>
        </div>
      </div>

      {/* Raw Data Toggle */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <button 
            onClick={() => setShowRawData(!showRawData)}
            className="text-lg font-bold text-gray-700 hover:text-gray-900"
          >
            Raw Transaction Data {showRawData ? "▼" : "▶"}
          </button>
        </div>
        {showRawData && (
          <div className="p-6">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}