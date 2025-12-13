import { useState, useEffect, useRef, useCallback } from "react";
import { importApi } from "../../../apis/importApi";
import { areaApi } from "../../../apis/areaApi";
import { flockApi } from "../../../apis/flockApi";
import swal from "sweetalert";

export function useImport() {
  const [imports, setImports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areaCurrentCounts, setAreaCurrentCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  const loadingRef = useRef(false);

  // LOAD IMPORT

  const loadAllImportPages = async () => {
    try {
      const firstRes = await importApi.getList({ page: 1 });
      const data = firstRes.data?.data;
      if (!data) return [];

      const totalPages = data.totalPages || 1;
      const allItems = [...(data.items || [])];

      if (totalPages > 1) {
        const promises = [];
        for (let p = 2; p <= totalPages; p++) {
          promises.push(importApi.getList({ page: p }));
        }

        const results = await Promise.all(promises);

        results.forEach((res) => {
          const items = res.data?.data?.items || [];
          allItems.push(...items);
        });
      }

      return Array.from(
        new Map(allItems.map((i) => [i._id, i])).values()
      );
    } catch (err) {
      console.error("Load import error:", err);
      return [];
    }
  };

  // LOAD IMPORT
  const loadData = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const list = await loadAllImportPages();
      setImports(list);
      return list;
    } catch (err) {
      console.error("Error load imports:", err);
      setImports([]);
      return [];
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // LOAD AREAS
  const loadAreas = useCallback(async () => {
    setAreaLoading(true);

    try {
      const res = await areaApi.getList();
      const list =
        res.data?.data?.items ||
        res.data?.data ||
        [];

      setAreas(list);

      const countMap = {};
      list.forEach((area) => {
        const inArea = imports.filter((i) => i.barn === area.name);
        countMap[area.name] = inArea.reduce(
          (sum, i) => sum + (i.quantity || 0),
          0
        );
      });

      setAreaCurrentCounts(countMap);
    } catch (err) {
      setAreas([]);
      swal("Lỗi", "Không thể tải khu nuôi!", "error");
    } finally {
      setAreaLoading(false);
    }
  }, [imports]);

  // CREATE IMPORT
  const createImport = async (data) => {
    try {
      const flockData = {
        initialCount: Number(data.quantity),
        speciesId: data.breed,
        areaId: data.barn,
        ownerId: "currentUser",
        avgWeight: Number(data.avgWeight),
        status: "Raising",
        currentCount: Number(data.quantity),
        note: `Nhập chuồng từ ${data.supplier}`,
      };

      const flockRes = await flockApi.create(flockData);
      const flockId = flockRes.data?.data?._id;

      await importApi.create({
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        flockId,
        status: "Đang nuôi",
      });

      await loadData();
      await loadAreas();
      
      return { success: true };
    } catch (err) {
      console.error("Create error:", err);
      swal("Lỗi", "Không thể tạo lứa nhập!", "error");
      throw err;
    }
  };

  // UPDATE IMPORT
  const updateImport = async (id, data) => {
    try {
      const detailRes = await importApi.getDetail(id);
      const oldImport = detailRes.data?.data;
      if (!oldImport) throw new Error("Không tìm thấy import");

      await importApi.update(id, {
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        flockId: oldImport.flockId,
        status: "Đang nuôi",
      });

      if (oldImport.flockId) {
        await flockApi.update(oldImport.flockId, {
          speciesId: data.breed,
          areaId: data.barn,
          avgWeight: Number(data.avgWeight),
          currentCount: Number(data.quantity),
          initialCount: Number(data.quantity),
          status: "Raising",
          note: `Cập nhật import ${id}`,
        });
      }

      await loadData();
      await loadAreas();
      
      return { success: true };
    } catch (err) {
      swal("Lỗi cập nhật!", "", "error");
      return false;
    }
  };

  // DELETE IMPORT
  const deleteImport = async (id) => {
    try {
      await importApi.delete(id);

      // reload dữ liệu
      await loadData();
      await loadAreas();

      return { success: true };
    } catch (err) {
      if (err.response?.status === 404) {
        await loadData();
        await loadAreas();
        return { success: true };
      }

      return { success: false, message: "Không thể xóa!" };
    }
  };


  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (imports.length > 0) loadAreas();
  }, [imports, loadAreas]);

  return {
    imports,
    areas,
    areaCurrentCounts,
    loading,
    areaLoading,
    loadData,
    loadAreas,
    createImport,
    updateImport,
    deleteImport,
  };
}
