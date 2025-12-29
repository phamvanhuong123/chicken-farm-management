import { useState, useEffect, useRef, useCallback } from "react";
import { importApi } from "../../../apis/importApi";
import { areaApi } from "../../../apis/areaApi";
import swal from "sweetalert";

export function useImport() {
  const [imports, setImports] = useState([]);
  const [areas, setAreas] = useState([]);
  const [areaCurrentCounts, setAreaCurrentCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [areaLoading, setAreaLoading] = useState(false);

  const loadingRef = useRef(false);
  const areasCacheRef = useRef([]);

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

  // LOAD AREAS - với retry mechanism
  const loadAreas = useCallback(async (retryCount = 0) => {
    setAreaLoading(true);

    try {
      const res = await areaApi.getList();
      const list =
        res.data?.data?.items ||
        res.data?.data ||
        [];

      // Lưu vào cache
      areasCacheRef.current = list;
      setAreas(list);

      calculateAreaCounts(list);
      console.log("✅ Đã tải danh sách khu nuôi:", list.length, "khu");

      return list;
    } catch (err) {
      console.error("❌ Lỗi khi tải khu nuôi:", err);

      // Thử lại nếu chưa quá 3 lần
      if (retryCount < 3) {
        console.log(`🔄 Thử lại lần ${retryCount + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return loadAreas(retryCount + 1);
      }

      setAreas([]);
      swal("Lỗi", "Không thể tải khu nuôi!", "error");
      return [];
    } finally {
      setAreaLoading(false);
    }
  }, []);

  // Tính toán số lượng gà trong mỗi khu
  const calculateAreaCounts = (areaList) => {
    const countMap = {};

    // Tính số gà hiện có trong mỗi khu = maxCapacity - currentCapacity
    for (const area of areaList) {
      const maxCapacity = area.maxCapacity || 0;
      const currentCapacity = area.currentCapacity || 0; // Dung lượng còn trống
      const currentCount = maxCapacity - currentCapacity; // Số gà hiện có

      countMap[area.name] = currentCount;
    }

    setAreaCurrentCounts(countMap);
    console.log("📊 Đã tính toán số gà trong các khu:", countMap);
  };

  // TÍNH TOÁN SỨC CHỨA TRỰC TIẾP
  const checkAreaCapacity = (areaName, quantity, excludeImportId = null) => {
    // Tìm khu nuôi
    const targetArea = areas.find(a => a.name === areaName);
    if (!targetArea) {
      return {
        isValid: false,
        message: `Không tìm thấy khu nuôi ${areaName}`
      };
    }

    // Lấy dung lượng còn trống
    let remainingCapacity = targetArea.currentCapacity || 0; // Dung lượng còn trống

    // Nếu có excludeImportId, kiểm tra xem import đó có ở khu này không
    if (excludeImportId) {
      const oldImport = imports.find(i => i._id === excludeImportId);
      if (oldImport && oldImport.barn === areaName && oldImport.status === "Đang nuôi") {
        // Thêm lại dung lượng cũ (vì sẽ được thay thế)
        remainingCapacity = remainingCapacity + oldImport.quantity;
      }
    }

    const maxCapacity = targetArea.maxCapacity || 0;
    const requestedQuantity = Number(quantity);

    // Kiểm tra nhanh
    if (remainingCapacity < 0) {
      return {
        isValid: false,
        message: `Khu nuôi ${areaName} có dữ liệu không hợp lệ!`
      };
    } else if (requestedQuantity > remainingCapacity) {
      return {
        isValid: false,
        message: `Khu nuôi ${areaName} không đủ dung lượng. Còn trống: ${remainingCapacity}`
      };
    }

    return {
      isValid: true,
      message: `Khu nuôi còn trống: ${remainingCapacity}`,
      remainingCapacity: remainingCapacity,
      currentCount: maxCapacity - remainingCapacity,
      maxCapacity
    };
  };

  // CREATE IMPORT - Tối ưu bằng optimistic update
  const createImport = async (data) => {
    try {
      // KIỂM TRA SỨC CHỨA TRƯỚC KHI TẠO (tính toán cục bộ)
      const capacityCheck = checkAreaCapacity(data.barn, data.quantity);

      if (!capacityCheck.isValid) {
        swal("Lỗi", capacityCheck.message, "error");
        throw new Error(capacityCheck.message);
      }

      // TẠO IMPORT (backend sẽ tự tạo flock)
      const importRes = await importApi.create({
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        status: "Đang nuôi",
      });

      if (!importRes.data?.data) {
        throw new Error("Không nhận được dữ liệu từ server");
      }

      // OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
      const newImport = {
        _id: importRes.data.data._id,
        ...data,
        flockId: importRes.data.data.flockId,
        status: "Đang nuôi"
      };

      setImports(prev => [newImport, ...prev]);

      // Cập nhật areaCurrentCounts ngay lập tức
      // Dung lượng trống giảm đi, số gà tăng lên
      setAreaCurrentCounts(prev => {
        const newCounts = { ...prev };
        // Tính số gà mới trong khu
        const currentCount = prev[data.barn] || 0;
        newCounts[data.barn] = currentCount + Number(data.quantity);
        return newCounts;
      });

      // Cập nhật areas cache để dung lượng trống giảm
      const updatedAreas = areas.map(area => {
        if (area.name === data.barn) {
          return {
            ...area,
            currentCapacity: Math.max(0, (area.currentCapacity || 0) - Number(data.quantity))
          };
        }
        return area;
      });
      setAreas(updatedAreas);
      areasCacheRef.current = updatedAreas;

      swal("Thành công", "Thêm lứa nhập thành công!", "success");

      // Load lại dữ liệu nền để đồng bộ hóa
      setTimeout(() => {
        loadData();
        loadAreas();
      }, 500);

      return { success: true };

    } catch (err) {
      console.error("Create error:", err);

      // Hiển thị lỗi cụ thể
      if (err.message.includes("không đủ sức chứa") || err.message.includes("không đủ dung lượng")) {
        swal("Lỗi", err.message, "error");
      } else if (err.response?.data?.message) {
        swal("Lỗi", err.response.data.message, "error");
      } else {
        swal("Lỗi", "Không thể tạo lứa nhập!", "error");
      }

      // Reload lại dữ liệu để đồng bộ
      loadData();
      loadAreas();

      throw err;
    }
  };

  // UPDATE IMPORT
  const updateImport = async (id, data) => {
    try {
      const detailRes = await importApi.getDetail(id);
      const oldImport = detailRes.data?.data;
      if (!oldImport) throw new Error("Không tìm thấy import");

      // KIỂM TRA SỨC CHỨA NẾU THAY ĐỔI KHU NUÔI HOẶC SỐ LƯỢNG
      const needsCapacityCheck = (data.barn && data.barn !== oldImport.barn) ||
        (data.quantity && data.quantity !== oldImport.quantity);

      if (needsCapacityCheck) {
        const targetBarn = data.barn || oldImport.barn;
        const targetQuantity = data.quantity || oldImport.quantity;

        const capacityCheck = checkAreaCapacity(targetBarn, targetQuantity, id);

        if (!capacityCheck.isValid) {
          swal("Lỗi", capacityCheck.message, "error");
          throw new Error(capacityCheck.message);
        }
      }

      // Cập nhật import (backend sẽ cập nhật flock)
      await importApi.update(id, {
        importDate: new Date(data.importDate).toISOString(),
        supplier: data.supplier,
        breed: data.breed,
        quantity: Number(data.quantity),
        avgWeight: Number(data.avgWeight),
        barn: data.barn,
        status: oldImport.status, // Giữ nguyên status
      });

      // OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức
      setImports(prev => prev.map(imp =>
        imp._id === id ? { ...imp, ...data } : imp
      ));

      // CẬP NHẬT DUNG LƯỢNG KHU NUÔI TRONG STATE
      if (data.barn && data.barn !== oldImport.barn) {
        // Chuyển khu nuôi
        setAreaCurrentCounts(prev => {
          const newCounts = { ...prev };

          // Khu cũ: giảm số gà
          newCounts[oldImport.barn] = Math.max(0, (newCounts[oldImport.barn] || 0) - oldImport.quantity);

          // Khu mới: tăng số gà
          newCounts[data.barn] = (newCounts[data.barn] || 0) + Number(data.quantity || oldImport.quantity);

          return newCounts;
        });

        // Cập nhật areas cache
        const updatedAreas = areas.map(area => {
          if (area.name === oldImport.barn) {
            // Khu cũ: tăng dung lượng trống
            return {
              ...area,
              currentCapacity: (area.currentCapacity || 0) + oldImport.quantity
            };
          } else if (area.name === data.barn) {
            // Khu mới: giảm dung lượng trống
            return {
              ...area,
              currentCapacity: Math.max(0, (area.currentCapacity || 0) - Number(data.quantity || oldImport.quantity))
            };
          }
          return area;
        });
        setAreas(updatedAreas);
        areasCacheRef.current = updatedAreas;
      }
      else if (data.quantity && data.quantity !== oldImport.quantity) {
        // Thay đổi số lượng trong cùng khu
        setAreaCurrentCounts(prev => ({
          ...prev,
          [oldImport.barn]: Math.max(
            0,
            (prev[oldImport.barn] || 0) + Number(data.quantity) - oldImport.quantity
          )
        }));

        // Cập nhật areas cache
        const updatedAreas = areas.map(area => {
          if (area.name === oldImport.barn) {
            const quantityDiff = Number(data.quantity) - oldImport.quantity;
            // quantityDiff dương: thêm gà -> giảm dung lượng trống
            // quantityDiff âm: bớt gà -> tăng dung lượng trống
            return {
              ...area,
              currentCapacity: Math.max(0, (area.currentCapacity || 0) - quantityDiff)
            };
          }
          return area;
        });
        setAreas(updatedAreas);
        areasCacheRef.current = updatedAreas;
      }

      swal("Thành công", "Cập nhật lứa nhập thành công!", "success");

      // Reload dữ liệu nền để đồng bộ hóa
      setTimeout(() => {
        loadData();
        loadAreas();
      }, 500);

      return { success: true };
    } catch (err) {
      console.error("Update error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Không thể cập nhật dữ liệu";
      swal("Lỗi cập nhật!", errorMessage, "error");
      return { success: false };
    }
  };

  // DELETE IMPORT - Sửa với xử lý lỗi tốt hơn
  const deleteImport = async (id) => {
    try {
      console.log(`🗑️ Frontend: Bắt đầu xóa import ${id}`);

      // Tìm import trước khi xóa để lấy thông tin
      const importToDelete = imports.find(imp => imp._id === id);

      if (!importToDelete) {
        swal("Lỗi", "Không tìm thấy đơn nhập cần xóa!", "error");
        return { success: false, message: "Không tìm thấy đơn nhập" };
      }

      // Gọi API để xóa import
      const response = await importApi.delete(id);

      if (!response.data) {
        throw new Error("Không nhận được phản hồi từ server");
      }

      console.log(`✅ Frontend: Đã xóa import ${id}`);

      // OPTIMISTIC UPDATE: xóa khỏi state ngay lập tức
      setImports(prev => prev.filter(imp => imp._id !== id));

      // Cập nhật areaCurrentCounts nếu import đang nuôi
      if (importToDelete && importToDelete.status === "Đang nuôi") {
        setAreaCurrentCounts(prev => ({
          ...prev,
          [importToDelete.barn]: Math.max(0, (prev[importToDelete.barn] || 0) - importToDelete.quantity)
        }));

        // Cập nhật areas cache
        const updatedAreas = areas.map(area => {
          if (area.name === importToDelete.barn) {
            // Xóa gà -> tăng dung lượng trống
            const newCapacity = (area.currentCapacity || 0) + importToDelete.quantity;
            console.log(`📈 Frontend: Cập nhật khu ${area.name}: ${area.currentCapacity} -> ${newCapacity}`);
            return {
              ...area,
              currentCapacity: newCapacity
            };
          }
          return area;
        });
        setAreas(updatedAreas);
        areasCacheRef.current = updatedAreas;
      }

      swal("Thành công", "Xóa đơn nhập thành công!", "success");

      // Load lại dữ liệu nền để đồng bộ hóa - KHÔNG chờ
      setTimeout(() => {
        console.log("🔄 Frontend: Đang tải lại dữ liệu...");
        loadData();
        loadAreas();
      }, 300);

      return { success: true, message: "Xóa thành công" };
    } catch (err) {
      console.error("❌ Frontend: Lỗi khi xóa import:", err);

      const errorMessage = err.response?.data?.message ||
        err.message ||
        "Không thể xóa đơn nhập!";

      swal("Lỗi", errorMessage, "error");

      // Reload lại dữ liệu để đồng bộ
      loadData();
      loadAreas();

      return { success: false, message: errorMessage };
    }
  };

  // Thêm hàm để làm mới cache khu nuôi
  const refreshAreasCache = async () => {
    try {
      const list = await loadAreas();
      return list;
    } catch (err) {
      console.error("Error refreshing areas cache:", err);
      return [];
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (imports.length > 0 && areas.length > 0) {
      calculateAreaCounts(areas);
    }
  }, [imports, areas]);

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
    refreshAreasCache,
  };
}