import React, { useState } from "react";
import { skuCodesAPI } from "@/services/api";
import "./CodeSearch.css";

const CodeSearch = () => {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(50);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await skuCodesAPI.searchSkus(query, limit);
      setResults(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to search SKUs. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (relevance) => {
    if (relevance >= 0.9) return "relevance-high";
    if (relevance >= 0.6) return "relevance-medium";
    return "relevance-low";
  };

  const getRelevanceLabel = (relevance) => {
    if (relevance >= 0.9) return "Excellent Match";
    if (relevance >= 0.6) return "Good Match";
    return "Partial Match";
  };

  return (
    <div className="code-search-container">
      <div className="search-form-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for product SKUs... (e.g., ring white gold, pear diamond, navy box)"
              disabled={loading}
            />
            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="search-options">
            <div className="search-option">
              <label htmlFor="limit">Results Limit:</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </form>

        <div className="search-help">
          <h4>Search Tips</h4>
          <ul>
            <li><strong>Fuzzy matching:</strong> Works with typos (e.g., "dimond" finds "diamond")</li>
            <li><strong>Synonyms:</strong> Understands "gold" → "18KWG", "wg", etc.</li>
            <li><strong>Multi-word:</strong> "ring white gold pear" finds relevant products</li>
            <li><strong>Abbreviations:</strong> "LG" finds "Lab Grown", "NAT" finds "Natural"</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="search-error">
          <p>{error}</p>
        </div>
      )}

      {results && (
        <div className="search-results">
          <div className="results-header">
            <h3>Search Results</h3>
            <div className="results-meta">
              <span className="results-query">Query: "{results.query}"</span>
              <span className="results-count">
                {results.totalResults} {results.totalResults === 1 ? "result" : "results"} found
              </span>
            </div>
          </div>

          {results.totalResults === 0 ? (
            <div className="no-results">
              <h4>No SKUs found</h4>
              <p>Try refining your search keywords or widening synonyms.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.results.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <div className="result-code-section">
                      <code className="result-code">{result.skuCode}</code>
                      <button
                        className="btn-copy-small"
                        onClick={() => navigator.clipboard.writeText(result.skuCode)}
                        title="Copy SKU"
                      >
                        Copy
                      </button>
                    </div>
                    <div className={`result-relevance ${getRelevanceColor(result.relevance)}`}>
                      <span className="relevance-score">
                        {(result.relevance * 100).toFixed(0)}%
                      </span>
                      <span className="relevance-label">
                        {getRelevanceLabel(result.relevance)}
                      </span>
                    </div>
                  </div>

                  <div className="result-details">
                    {result.itemName && (
                      <div className="result-detail">
                        <span className="detail-label">Item:</span>
                        <span className="detail-value">{result.itemName}</span>
                      </div>
                    )}
                    {result.description && (
                      <div className="result-detail">
                        <span className="detail-label">Description:</span>
                        <span className="detail-value">{result.description}</span>
                      </div>
                    )}
                    {result.category && (
                      <div className="result-detail">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value category-badge">{result.category}</span>
                      </div>
                    )}
                    {result.price !== null && result.price !== undefined && (
                      <div className="result-detail">
                        <span className="detail-label">Price:</span>
                        <span className="detail-value price">
                          ${result.price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeSearch;
