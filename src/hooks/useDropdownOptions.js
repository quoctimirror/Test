import { useState, useEffect } from "react";
import { dropdownConfigAPI } from "@/services/api";

/**
 * Custom hook to fetch and manage dropdown configuration options
 * for SKU generation forms
 */
export const useDropdownOptions = () => {
  const [options, setOptions] = useState({
    prefixes: [],
    materials: [],
    materialColors: [],
    stoneOrigins: [],
    stoneShapes: [],
    stoneWeights: [],
    sideStones: [],
    countries: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all dropdown options in parallel
        const [
          prefixesRes,
          materialsRes,
          materialColorsRes,
          stoneOriginsRes,
          stoneShapesRes,
          stoneWeightsRes,
          sideStonesRes,
          countriesRes,
        ] = await Promise.all([
          dropdownConfigAPI.getPrefixes(),
          dropdownConfigAPI.getMaterials(),
          dropdownConfigAPI.getMaterialColors(),
          dropdownConfigAPI.getStoneOrigins(),
          dropdownConfigAPI.getStoneShapes(),
          dropdownConfigAPI.getStoneWeights(),
          dropdownConfigAPI.getSideStones(),
          dropdownConfigAPI.getCountries(),
        ]);

        setOptions({
          prefixes: prefixesRes.data || [],
          materials: materialsRes.data || [],
          materialColors: materialColorsRes.data || [],
          stoneOrigins: stoneOriginsRes.data || [],
          stoneShapes: stoneShapesRes.data || [],
          stoneWeights: stoneWeightsRes.data || [],
          sideStones: sideStonesRes.data || [],
          countries: countriesRes.data || [],
        });
      } catch (err) {
        console.error("Failed to fetch dropdown options:", err);
        setError(
          "Failed to load dropdown options. Please refresh the page or contact support."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllOptions();
  }, []); // Empty dependency array - fetch once on mount

  return {
    options,
    loading,
    error,
  };
};
