import { useState, useEffect } from "react";
import { importApi } from "../../../apis/importApi";
import { areaApi } from "../../../apis/areaApi"; 
import { flockApi } from "../../../apis/flockApi"; 
export function useImport() {
  const [imports, setImports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);
  const [areaCurrentCounts, setAreaCurrentCounts] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await importApi.getList();
      setImports(res.data.data.items || []);
    } catch (error) {
      console.error("Error loading imports:", error);
      setImports([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAreas = async () => {
    setAreaLoading(true);
    try {
      const res = await areaApi.getList();
      const areaData = res.data.data || [];
      setAreas(areaData);
      
      const counts = {};
      areaData.forEach(area => {
        const importsInArea = imports.filter(imp => imp.barn === area.name);
        const totalInArea = importsInArea.reduce((sum, imp) => {
          return sum + (imp.quantity || 0);
        }, 0);
        
        counts[area.name] = totalInArea;
      });
      
      setAreaCurrentCounts(counts);
      
    } catch (error) {
      console.error("Error loading areas:", error);
      setAreas([]);
    } finally {
      setAreaLoading(false);
    }
  };
  const createImport = async (data) => {
    try {
      // 1. Tạo ImportRecord (hiện tại)
      const importRes = await importApi.create(data);
      
      // 2. Tạo Flock mới từ dữ liệu nhập
      const flockData = {
        initialCount: parseInt(data.quantity) || 0,
        speciesId: data.breed || "Gà thịt",
        areaId: data.barn,
        ownerId: "currentUserId", 
        avgWeight: parseFloat(data.avgWeight) || 0,
        status: "Raising",
        currentCount: parseInt(data.quantity) || 0,
        note: `Nhập chuồng từ ${data.supplier}`,
      };
      
      const flockRes = await flockApi.create(flockData);
    
      const areasRes = await areaApi.getList();
      const area = areasRes.data.data?.items?.find(a => a.name === data.barn);
      
      if (area && area._id) {
        const updatedAreaData = {
          currentCapacity: (area.currentCapacity || 0) + parseInt(data.quantity)
        };
        await areaApi.update(area._id, updatedAreaData);
      }
      
      // 4. Reload data
      await loadData();
      await loadAreas();
      
      return importRes;
      
    } catch (error) {
      console.error("Error in createImport:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (imports.length > 0) {
      loadAreas();
    }
  }, [imports]);

  return {
    imports,
    areas,
    areaCurrentCounts,
    loading,
    areaLoading,
    loadData,
    loadAreas,
    createImport,
  };
}