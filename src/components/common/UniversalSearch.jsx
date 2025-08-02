import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { search, handleApiError } from "../../services/esploraApi";

export default function UniversalSearch({ placeholder = "Search blocks, transactions, addresses..." }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const detectSearchType = (searchQuery) => {
    const trimmedQuery = searchQuery.trim();
    
    // Block height (numeric)
    if (/^\d+$/.test(trimmedQuery)) {
      return { type: "block_height", value: parseInt(trimmedQuery) };
    }
    
    // Transaction ID or Block Hash (64 character hex)
    if (/^[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
      return { type: "hash", value: trimmedQuery };
    }
    
    // Liquid addresses (various formats)
    if (
      /^[2-9A-HJ-NP-Z]{26,35}$/.test(trimmedQuery) || // Legacy address
      /^bc1[a-z0-9]{39,59}$/.test(trimmedQuery) || // Bech32
      /^VJL[a-zA-Z0-9]{50,87}$/.test(trimmedQuery) || // Liquid legacy
      /^VT[a-zA-Z0-9]{50,87}$/.test(trimmedQuery) || // Liquid legacy
      /^lq1[a-z0-9]{39,87}$/.test(trimmedQuery) || // Liquid bech32
      /^ex1[a-z0-9]{39,87}$/.test(trimmedQuery) // Elements bech32
    ) {
      return { type: "address", value: trimmedQuery };
    }
    
    // Asset ID (64 character hex, but different from tx/block)
    if (/^[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
      return { type: "asset_or_hash", value: trimmedQuery };
    }
    
    // Short hash or partial search
    if (/^[a-fA-F0-9]{8,63}$/.test(trimmedQuery)) {
      return { type: "partial_hash", value: trimmedQuery };
    }
    
    return { type: "unknown", value: trimmedQuery };
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchType = detectSearchType(query);
      
      switch (searchType.type) {
        case "block_height":
          navigate(`/block-height/${searchType.value}`);
          break;
          
        case "address":
          navigate(`/address/${searchType.value}`);
          break;
          
        case "hash":
        case "asset_or_hash":
        case "partial_hash":
          // Try to search and let the API determine what it is
          try {
            const result = await search(query.trim());
            
            // Check the response to determine what type of data we got
            if (result.data.txid) {
              // It's a transaction
              navigate(`/tx/${result.data.txid}`);
            } else if (result.data.id && result.data.height !== undefined) {
              // It's a block
              navigate(`/block/${result.data.id}`);
            } else if (result.data.asset_id) {
              // It's an asset
              navigate(`/asset/${result.data.asset_id}`);
            } else {
              // Try as transaction first, then block, then asset
              navigate(`/tx/${query.trim()}`);
            }
          } catch (searchError) {
            // If search fails, try direct navigation based on most likely type
            if (searchType.type === "hash") {
              navigate(`/tx/${query.trim()}`);
            } else {
              throw searchError;
            }
          }
          break;
          
        default:
          // Try generic search
          const result = await search(query.trim());
          if (result.data.txid) {
            navigate(`/tx/${result.data.txid}`);
          } else if (result.data.id) {
            navigate(`/block/${result.data.id}`);
          } else {
            navigate(`/search/${encodeURIComponent(query.trim())}`);
          }
      }
      
      setQuery(""); // Clear search after successful navigation
      
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(`Search failed: ${errorInfo.details}`);
    } finally {
      setLoading(false);
    }
  };

  const getSearchHint = () => {
    if (!query.trim()) return "";
    
    const searchType = detectSearchType(query);
    
    switch (searchType.type) {
      case "block_height":
        return "🔍 Block height";
      case "hash":
        return "🔍 Transaction/Block hash";
      case "address":
        return "🔍 Address";
      case "asset_or_hash":
        return "🔍 Asset/Transaction/Block";
      case "partial_hash":
        return "🔍 Partial hash";
      default:
        return "🔍 Search";
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          
          {/* Search hint */}
          {query.trim() && (
            <div className="absolute right-12 top-2 text-xs text-gray-400">
              {getSearchHint()}
            </div>
          )}
          
          {/* Loading spinner */}
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm z-10">
          {error}
        </div>
      )}
      
      {/* Search suggestions/examples */}
      {!query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-xs text-gray-600">
          <div className="font-medium mb-2">Search examples:</div>
          <div className="space-y-1">
            <div><span className="font-mono bg-gray-100 px-1 rounded">123456</span> - Block height</div>
            <div><span className="font-mono bg-gray-100 px-1 rounded">abc123...</span> - Transaction/Block hash</div>
            <div><span className="font-mono bg-gray-100 px-1 rounded">VJL...</span> - Liquid address</div>
            <div><span className="font-mono bg-gray-100 px-1 rounded">lq1...</span> - Liquid bech32 address</div>
          </div>
        </div>
      )}
    </div>
  );
}