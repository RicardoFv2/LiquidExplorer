import axios from "axios";

// Base URL for Liquid testnet Esplora API
const BASE_URL = "https://blockstream.info/liquidtestnet/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Network and Statistics APIs
export const getNetworkStats = () => api.get("/stats");
export const getMempoolStats = () => api.get("/mempool");
export const getFeeEstimates = () => api.get("/fee-estimates");

// Block APIs
export const getLatestBlocks = (start_height = null) => {
  const params = start_height ? { start_height } : {};
  return api.get("/blocks", { params });
};

export const getBlock = (hash) => api.get(`/block/${hash}`);
export const getBlockStatus = (hash) => api.get(`/block/${hash}/status`);
export const getBlockTxs = (hash, start_index = 0) => api.get(`/block/${hash}/txs/${start_index}`);
export const getBlockTxids = (hash) => api.get(`/block/${hash}/txids`);
export const getBlockHeader = (hash) => api.get(`/block/${hash}/header`);
export const getBlockRaw = (hash) => api.get(`/block/${hash}/raw`);

// Get block by height
export const getBlockAtHeight = (height) => api.get(`/block-height/${height}`);

// Transaction APIs
export const getTransaction = (txid) => api.get(`/tx/${txid}`);
export const getTransactionStatus = (txid) => api.get(`/tx/${txid}/status`);
export const getTransactionHex = (txid) => api.get(`/tx/${txid}/hex`);
export const getTransactionRaw = (txid) => api.get(`/tx/${txid}/raw`);
export const getTransactionMerkleProof = (txid) => api.get(`/tx/${txid}/merkle-proof`);
export const getTransactionOutspend = (txid, vout) => api.get(`/tx/${txid}/outspend/${vout}`);
export const getTransactionOutspends = (txid) => api.get(`/tx/${txid}/outspends`);

// Address APIs
export const getAddress = (address) => api.get(`/address/${address}`);
export const getAddressStats = (address) => api.get(`/address/${address}/stats`);
export const getAddressTxs = (address, last_seen_txid = null) => {
  const params = last_seen_txid ? { last_seen_txid } : {};
  return api.get(`/address/${address}/txs`, { params });
};
export const getAddressTxsChain = (address, last_seen_txid = null) => {
  const params = last_seen_txid ? { last_seen_txid } : {};
  return api.get(`/address/${address}/txs/chain`, { params });
};
export const getAddressTxsMempool = (address) => api.get(`/address/${address}/txs/mempool`);
export const getAddressUtxo = (address) => api.get(`/address/${address}/utxo`);

// Asset APIs (Liquid specific)
export const getAsset = (asset_id) => api.get(`/asset/${asset_id}`);
export const getAssetTxs = (asset_id, last_seen_txid = null) => {
  const params = last_seen_txid ? { last_seen_txid } : {};
  return api.get(`/asset/${asset_id}/txs`, { params });
};
export const getAssetTxsChain = (asset_id, last_seen_txid = null) => {
  const params = last_seen_txid ? { last_seen_txid } : {};
  return api.get(`/asset/${asset_id}/txs/chain`, { params });
};
export const getAssetTxsMempool = (asset_id) => api.get(`/asset/${asset_id}/txs/mempool`);
export const getAssetSupply = (asset_id) => api.get(`/asset/${asset_id}/supply`);

// Asset Registry APIs
export const getAssetRegistry = (params = {}) => {
  const defaultParams = {
    start_index: 0,
    limit: 25,
    sort_field: "ticker",
    sort_dir: "asc"
  };
  return api.get("/assets/registry", { params: { ...defaultParams, ...params } });
};

// Search API - handles multiple types of searches
export const search = (query) => {
  // Determine search type based on query format
  if (query.length === 64) {
    // Could be block hash or transaction ID
    return getTransaction(query).catch(() => getBlock(query));
  } else if (query.length === 62 || query.length === 42 || query.startsWith('VJL') || query.startsWith('VT')) {
    // Liquid address patterns
    return getAddress(query);
  } else if (/^\d+$/.test(query)) {
    // Block height
    return getBlockAtHeight(parseInt(query));
  } else {
    // Fallback to transaction search
    return getTransaction(query);
  }
};

// Broadcasting APIs
export const broadcastTransaction = (txHex) => {
  return api.post("/tx", txHex, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};

// Utility function to handle API errors consistently
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText;
    
    switch (status) {
      case 400:
        return { error: "Invalid request", details: message };
      case 404:
        return { error: "Not found", details: message };
      case 429:
        return { error: "Rate limit exceeded", details: "Please try again later" };
      case 500:
        return { error: "Server error", details: "Please try again later" };
      default:
        return { error: `HTTP ${status}`, details: message };
    }
  } else if (error.request) {
    // Network error
    return { error: "Network error", details: "Unable to connect to the server" };
  } else {
    // Other error
    return { error: "Unknown error", details: error.message };
  }
};

// Helper function to format satoshi values
export const formatSatoshis = (sats, decimals = 8) => {
  if (sats === null || sats === undefined) return "0";
  return (sats / 100000000).toFixed(decimals);
};

// Helper function to format timestamps
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp * 1000).toLocaleString();
};

// Helper function to truncate hash/address for display
export const truncateHash = (hash, start = 8, end = 8) => {
  if (!hash) return "";
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
};

export default {
  // Network
  getNetworkStats,
  getMempoolStats,
  getFeeEstimates,
  
  // Blocks
  getLatestBlocks,
  getBlock,
  getBlockStatus,
  getBlockTxs,
  getBlockTxids,
  getBlockHeader,
  getBlockRaw,
  getBlockAtHeight,
  
  // Transactions
  getTransaction,
  getTransactionStatus,
  getTransactionHex,
  getTransactionRaw,
  getTransactionMerkleProof,
  getTransactionOutspend,
  getTransactionOutspends,
  
  // Addresses
  getAddress,
  getAddressStats,
  getAddressTxs,
  getAddressTxsChain,
  getAddressTxsMempool,
  getAddressUtxo,
  
  // Assets
  getAsset,
  getAssetTxs,
  getAssetTxsChain,
  getAssetTxsMempool,
  getAssetSupply,
  getAssetRegistry,
  
  // Utilities
  search,
  broadcastTransaction,
  handleApiError,
  formatSatoshis,
  formatTimestamp,
  truncateHash
};