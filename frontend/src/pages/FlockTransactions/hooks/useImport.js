import { useState, useEffect } from "react";
import { importApi } from "../../../apis/importApi";
import { areaApi } from "../../../apis/areaApi"; 

export function useImport() {
  const [imports, setImports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await importApi.getList();
    setImports(res.data.data.items);
    setLoading(false);
  };

  const loadAreas = async () => {
    setAreaLoading(true);
    try {
      const res = await areaApi.getList();
      setAreas(res.data.data || []);
    } catch (error) {
      console.error("Error loading areas:", error);
      setAreas([]);
    } finally {
      setAreaLoading(false);
    }
  };

  const createImport = async (data) => {
    const res = await importApi.create(data);
    await loadData();
    return res;
  };

  useEffect(() => {
    loadData();
    loadAreas();
  }, []);

  return {
    imports,
    areas,
    loading,
    areaLoading,
    loadData,
    loadAreas,
    createImport,
  };
}