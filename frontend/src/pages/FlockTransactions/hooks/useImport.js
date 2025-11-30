import { useState, useEffect } from "react";
import { importApi } from "../../../apis/importApi";

export function useImport() {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await importApi.getList();
      setImports(res.data.data.items || []);
    } catch (err) {
      setError("Không thể tải dữ liệu");
      console.error("Error loading imports:", err);
    } finally {
      setLoading(false);
    }
  };

  const createImport = async (data) => {
    setError(null);
    try {
      const importData = {
        ...data,
        status: "Đang nuôi",
        quantity: parseInt(data.quantity),
        avgWeight: parseFloat(data.avgWeight)
      };
      
      const res = await importApi.create(importData);
      await loadData(); 
    } catch (err) {
      setError("Không thể tạo lứa nhập chuồng");
      console.error("Error creating import:", err);
      throw err;
    }
  };

  return {
    imports,
    loading,
    error,
    loadData,
    createImport,
  };
}