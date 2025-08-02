import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  getAddress, 
  getAddressStats, 
  getAddressTxs, 
  getAddressUtxo,
  formatTimestamp, 
  formatSatoshis, 
  truncateHash, 
  handleApiError 
} from "../../services/esploraApi";

export default function AddressDetail() {
  const { address } = useParams();
  const [addressInfo, setAddressInfo] = useState(null);
  const [addressStats, setAddressStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [utxos, setUtxos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(false);
  const [error, setError] = useState(null);
  const [lastSeenTxid, setLastSeenTxid] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  useEffect(() => {
    fetchAddressData();
  }, [address]);

  const fetchAddressData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch address info, stats, and initial transactions
      const [addressResponse, statsResponse, txsResponse, utxoResponse] = await Promise.all([
        getAddress(address),
        getAddressStats(address),
        getAddressTxs(address),
        getAddressUtxo(address)
      ]);
      
      setAddressInfo(addressResponse.data);
      setAddressStats(statsResponse.data);
      setTransactions(txsResponse.data);
      setUtxos(utxoResponse.data);
      
      // Set last seen txid for pagination
      if (txsResponse.data.length > 0) {
        setLastSeenTxid(txsResponse.data[txsResponse.data.length - 1].txid);
      }
      
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.error + ": " + errorInfo.details);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreTransactions = async () => {
    if (!lastSeenTxid) return;
    
    try {
      setLoadingTxs(true);
      const response = await getAddressTxs(address, lastSeenTxid);
      
      if (response.data.length > 0) {
        setTransactions(prev => [...prev, ...response.data]);
        setLastSeenTxid(response.data[response.data.length - 1].txid);
      } else {
        setLastSeenTxid(null); // No more transactions
      }
    } catch (err) {
      console.error("Error loading more transactions:", err);
    } finally {
      setLoadingTxs(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading address details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Address</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAddressData} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const getTransactionValue = (tx, targetAddress) => {
    // Calculate net value for this address in the transaction
    let received = 0;
    let sent = 0;
    
    // Check outputs (received)
    tx.vout?.forEach(output => {
      if (output.scriptpubkey_address === targetAddress) {
        received += output.value || 0;
      }
    });
    
    // Check inputs (sent)
    tx.vin?.forEach(input => {
      if (input.prevout?.scriptpubkey_address === targetAddress) {
        sent += input.prevout.value || 0;
      }
    });
    
    return { received, sent, net: received - sent };
  };

  const renderTransactionValue = (tx) => {
    const { received, sent, net } = getTransactionValue(tx, address);
    
    if (net > 0) {
      return <span className="text-green-600 font-medium">+{formatSatoshis(received)} L-BTC</span>;
    } else if (net < 0) {
      return <span className="text-red-600 font-medium">-{formatSatoshis(sent)} L-BTC</span>;
    } else {
      return <span className="text-gray-600">±0 L-BTC</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Address Details</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 font-mono text-sm break-all">{address}</span>
          <button
            onClick={() => copyToClipboard(address)}
            className="text-blue-500 hover:text-blue-700 text-xs"
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {/* Address Summary */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Address Summary</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatSatoshis(addressInfo?.chain_stats?.funded_txo_sum || 0)} L-BTC
              </div>
              <div className="text-sm text-gray-600">Total Received</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatSatoshis(addressInfo?.chain_stats?.spent_txo_sum || 0)} L-BTC
              </div>
              <div className="text-sm text-gray-600">Total Sent</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatSatoshis((addressInfo?.chain_stats?.funded_txo_sum || 0) - (addressInfo?.chain_stats?.spent_txo_sum || 0))} L-BTC
              </div>
              <div className="text-sm text-gray-600">Current Balance</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {(addressInfo?.chain_stats?.tx_count || 0) + (addressInfo?.mempool_stats?.tx_count || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "transactions" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Transactions ({addressInfo?.chain_stats?.tx_count || 0})
            </button>
            <button
              onClick={() => setActiveTab("utxos")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "utxos" 
                  ? "border-b-2 border-blue-500 text-blue-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              UTXOs ({utxos.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "transactions" && (
            <div>
              {transactions.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No transactions found</div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
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
                              {tx.status?.block_time ? formatTimestamp(tx.status.block_time) : "Unconfirmed"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                tx.status?.confirmed 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {tx.status?.confirmed ? "Confirmed" : "Unconfirmed"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                              {renderTransactionValue(tx)}
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
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            to={`/tx/${tx.txid}`} 
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                          >
                            {truncateHash(tx.txid, 12, 12)}
                          </Link>
                          <div className="text-right">
                            {renderTransactionValue(tx)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span>{tx.status?.block_time ? formatTimestamp(tx.status.block_time) : "Unconfirmed"}</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            tx.status?.confirmed 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {tx.status?.confirmed ? "Confirmed" : "Unconfirmed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {lastSeenTxid && (
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
          )}

          {activeTab === "utxos" && (
            <div>
              {utxos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No unspent outputs found</div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Output
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {utxos.map((utxo, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Link 
                                to={`/tx/${utxo.txid}`} 
                                className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                              >
                                {truncateHash(utxo.txid, 16, 0)}:{utxo.vout}
                              </Link>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatSatoshis(utxo.value)} L-BTC
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                utxo.status?.confirmed 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {utxo.status?.confirmed ? "Confirmed" : "Unconfirmed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {utxos.map((utxo, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Link 
                            to={`/tx/${utxo.txid}`} 
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm break-all"
                          >
                            {truncateHash(utxo.txid, 12, 12)}:{utxo.vout}
                          </Link>
                          <div className="text-right font-medium">
                            {formatSatoshis(utxo.value)} L-BTC
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            utxo.status?.confirmed 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {utxo.status?.confirmed ? "Confirmed" : "Unconfirmed"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}