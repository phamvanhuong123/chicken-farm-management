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

  const loadAllImportPages = async () => {
    let allItems = [];

    try {
      const firstRes = await importApi.getList({ page: 1 });
      const data = firstRes.data?.data;

      if (!data) return [];

      const totalPages = data.totalPages || 1;
      const firstItems = data.items || [];
      allItems.push(...firstItems);

      if (totalPages === 1) {
        return removeDuplicateImports(allItems);
      }

      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(importApi.getList({ page }));
      }

      const results = await Promise.all(pagePromises);

      results.forEach((res) => {
        const items = res?.data?.data?.items || [];
        allItems.push(...items);
      });

      return removeDuplicateImports(allItems);

    } catch (err) {
      console.error("Load import error:", err);
      return [];
    }
  };

  const removeDuplicateImports = (arr) => {
    const map = new Map();
    arr.forEach((item) => {
      if (!map.has(item._id)) {
        map.set(item._id, item);
      }
    });
    return Array.from(map.values());
  };

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const allImports = await loadAllImportPages();
      setImports(allImports);
      return allImports;
    } catch (error) {
      console.error("Error loading imports:", error);
      setImports([]);
      return [];
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const loadAreas = useCallback(async () => {
    setAreaLoading(true);

    try {
      const res = await areaApi.getList();
      const list = res.data?.data?.items || res.data?.data || [];
      setAreas(list);

      const countMap = {};
      list.forEach((area) => {
        const itemsInArea = imports.filter((i) => i.barn === area.name);
        const total = itemsInArea.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        countMap[area.name] = total;
      });

      setAreaCurrentCounts(countMap);
    } catch (error) {
      setAreas([]);
      swal("Lỗi", "Không thể tải danh sách khu nuôi.", "error");
    } finally {
      setAreaLoading(false);
    }
  }, [imports]);

  const createImport = async (data) => {
    try {
      // 1. Tạo flock mới
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

      // 2. Tạo import record
      const importPayload = {
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        flockId,
        status: "Đang nuôi",
      };

      await importApi.create(importPayload);

      await loadData();
      await loadAreas();

    } catch (err) {
      console.error("Create import error:", err);
      swal("Lỗi", "Không thể tạo lứa nhập!", "error");
      throw err;
    }
  };
  
  // Hàm cập nhật import
  const updateImport = async (id, data) => {
    try {
      // 1. Lấy thông tin import cũ
      const oldImportRes = await importApi.getDetail(id);
      const oldImport = oldImportRes.data?.data;
      
      if (!oldImport) {
        throw new Error("Không tìm thấy đơn nhập");
      }

      // 2. Cập nhật import record
      const importPayload = {
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        status: "Đang nuôi",
        flockId: oldImport.flockId
      };

      await importApi.update(id, importPayload);

      // 3. Nếu có flockId, cập nhật flock tương ứng
      if (oldImport.flockId) {
        try {
          const flockUpdateData = {
            speciesId: data.breed,
            areaId: data.barn,
            avgWeight: Number(data.avgWeight),
            currentCount: Number(data.quantity),
            initialCount: Number(data.quantity),
            status: "Raising",
            note: `Cập nhật từ import ${id}`
          };
          
          await flockApi.update(oldImport.flockId, flockUpdateData);
        } catch (flockError) {
          console.error("Lỗi cập nhật flock:", flockError);
        }
      }

      // 4. Reload dữ liệu
      await loadData();
      await loadAreas();

      return true;
    } catch (err) {
      console.error("Update import error:", err);
      swal("Thao tác không thành công, vui lòng thử lại.", "", "error");
      return false;
    }
  };

  // Hàm xóa import - SỬA LỖI Ở ĐÂY
    const deleteImport = async (id) => {
    try {
      // 1. Lấy thông tin import để xóa flock tương ứng
      let importItem = null;
      try {
        const importRes = await importApi.getDetail(id);
        importItem = importRes.data?.data;
      } catch (getError) {
        console.warn("Không thể lấy thông tin import:", getError.message);
      }
      
      // 2. Xóa import record
      const deleteResponse = await importApi.delete(id);
      
      // Kiểm tra phản hồi từ server
      if (deleteResponse.status !== 200 && deleteResponse.status !== 204) {
        throw new Error(`HTTP ${deleteResponse.status}: ${deleteResponse.statusText}`);
      }

      // 3. Nếu có flockId, xóa flock tương ứng
      if (importItem?.flockId) {
        try {
          await flockApi.delete(importItem.flockId);
        } catch (flockError) {
          console.warn("Lỗi xóa flock:", flockError.message);
        }
      }

      // 4. Reload dữ liệu
      await loadData();
      await loadAreas();

      return { success: true, message: "Xóa đơn nhập thành công!" };
      
    } catch (err) {
      console.error("Delete import error:", err);
      
      // Xác định thông báo lỗi
      let errorMessage = "Không thể xóa đơn nhập!";
      
      if (err.response) {
        const status = err.response.status;
        const serverMessage = err.response.data?.message;
        
        if (status === 404) {
          // Đơn nhập đã bị xóa, nhưng vẫn coi là thành công
          await loadData();
          await loadAreas();
          return { success: true, message: "Đơn nhập đã được xóa thành công!" };
          
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (err.request) {
        errorMessage = "Không thể kết nối đến server.";
      }
      
      return { success: false, message: errorMessage };
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
    deleteImport
  };
}