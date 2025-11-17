import React, { useEffect, useState } from "react";
import { materialAPI } from "~/apis/material.api";
import { toast } from "react-hot-toast";
import MaterialDetail from "./MaterialDetail"; // 🆕 thêm import
import {
  FaBox,
  FaExclamationTriangle,
  FaClock,
  FaMoneyBillWave,
  FaSearch,
} from "react-icons/fa";
import { ArrowDownFromLine, ArrowDownToLine, Edit, Eye, PlusIcon, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";

// 🎨 Badge màu động (nếu có)
const TypeBadge = ({ type, color }) => {
  const bg = color ? `${color}20` : "#f3f4f6"; // màu nhạt (alpha)
  const text = color || "#4b5563";
  return (
    <span
      className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap border"
      style={{ backgroundColor: bg, color: text, borderColor: text }}
    >
      {type}
    </span>
  );
};

export default function Inventory() {
  // 🧠 Toàn bộ state
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [file, setFile] = useState(null);
  const [types, setTypes] = useState([]);
  const [typeColors, setTypeColors] = useState({});
  const [selectedMaterial, setSelectedMaterial] = useState(null); // 🆕 thêm đúng vị trí

  // ⏱ Debounce tìm kiếm
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword.trim()), 500);
    return () => clearTimeout(t);
  }, [keyword]);

  // 📦 Lấy dữ liệu
  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (typeFilter !== "Tất cả") params.type = typeFilter;
      const res = await materialAPI.getAll(params);
      const items = res.data.data.items || [];
      setMaterials(items);

      // Map loại và màu
      const colorMap = {};
      const typeList = new Set();
      for (const i of items) {
        if (i.type) {
          typeList.add(i.type);
          if (i.colorCode) colorMap[i.type] = i.colorCode;
        }
      }
      setTypes([...typeList]);
      setTypeColors(colorMap);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu vật tư!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, statusFilter, debouncedKeyword]);

  // 📤 Xuất Excel
  const handleExport = async () => {
    try {
      const params = {};
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (typeFilter !== "Tất cả") params.type = typeFilter;
      const res = await materialAPI.exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "materials.xlsx";
      a.click();
      toast.success("Đã tải file Excel!");
    } catch {
      toast.error("Xuất Excel thất bại!");
    }
  };

  // 📥 Nhập Excel
  const handleImport = async () => {
    if (!file) return toast.error("Vui lòng chọn file Excel!");
    try {
      const res = await materialAPI.importExcel(file);
      toast.success(res.data.message);
      if (res.data.errors?.length) {
        console.table(res.data.errors);
        toast.error("Một số dòng bị lỗi (xem console)");
      }
      setFile(null);
      fetchData();
    } catch {
      toast.error("Lỗi khi nhập Excel!");
    }
  };

  // 💡 Thống kê
  const total = materials.length;
  const almostEmpty = materials.filter(
    (m) => m.statusInfo.label === "Sắp hết"
  ).length;
  const expiring = materials.filter(
    (m) => m.statusInfo.label === "Gần hết hạn"
  ).length;
  const warehouseValue = materials.reduce(
    (sum, m) => sum + (m.quantity || 0) * 1000,
    0
  );

  const filtered = materials.filter((m) =>
    statusFilter === "Tất cả" ? true : m.statusInfo.label === statusFilter
  );

  const statusOptions = ["Tất cả", "Sắp hết", "Gần hết hạn", "Bình thường"];

  // Badge trạng thái
  const StatusBadge = ({ label }) => {
    const map = {
      "Sắp hết": "bg-red-100 text-red-600",
      "Gần hết hạn": "bg-orange-100 text-orange-600",
      "Bình thường": "bg-green-100 text-green-600",
    };
    return (
      <span
        className={`${
          map[label] || "bg-gray-100 text-gray-600"
        } px-2 py-1 rounded text-xs font-medium whitespace-nowrap`}
      >
        {label}
      </span>
    );
  };

  // ==============================
  // 📋 Giao diện chính
  // ==============================
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen text-[14px]">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Kho vật tư</h1>
          <p className="text-gray-600 text-sm">
            Quản lý tồn kho và vật tư trang trại
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="px-2 py-2 border rounded-md bg-white hover:bg-gray-100 text-sm cursor-pointer flex items-center gap-1.5">
            <ArrowDownToLine size={15} /> Nhập Excel
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            className="px-2 py-2 border rounded-md bg-white hover:bg-gray-100 text-sm cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownFromLine size={15} className="rotate-180"  /> Xuất Excel
          </button>

          {file && (
            <button
              onClick={handleImport}
              className="px-3 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
            >
             Xác nhận
            </button>
          )}

          <Button   className={'bg-green-400 hover:bg-green-500 cursor-pointer'}> <PlusIcon/>Thêm vật tư</Button>

        </div>
      </div>

      {/* Thống kê */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <FaBox className="text-blue-500 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Tổng vật tư</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Sắp hết</p>
            <p className="text-2xl font-bold text-red-600">{almostEmpty}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <FaClock className="text-orange-500 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Gần hết hạn</p>
            <p className="text-2xl font-bold text-orange-500">{expiring}</p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center gap-3">
          <FaMoneyBillWave className="text-green-500 text-2xl" />
          <div>
            <p className="text-gray-500 text-sm">Giá trị kho</p>
            <p className="text-2xl font-bold text-green-600">
              {warehouseValue.toLocaleString()}₫
            </p>
          </div>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white shadow rounded-lg p-4 flex flex-wrap gap-3 items-center">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Tìm kiếm vật tư..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border rounded-md pl-8 pr-3 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
        >
          <option value="Tất cả">Loại</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          onClick={fetchData}
          className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          <FaSearch /> Tìm
        </button>
      </div>

      {/* Bảng */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-[14px] whitespace-nowrap">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Tên vật tư</th>
              <th className="p-3 text-left">Loại</th>
              <th className="p-3 text-center">SL tồn</th>
              <th className="p-3 text-center">Đơn vị</th>
              <th className="p-3 text-center">HSD</th>
              <th className="p-3 text-center">Ngưỡng</th>
              <th className="p-3 text-center">Vị trí</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-4 italic text-gray-500"
                >
                  Không có vật tư phù hợp.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr
                  key={m._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                  style={{
                    borderLeft: `4px solid ${typeColors[m.type] || "#ccc"}`,
                  }}
                >
                  <td className="p-3 font-medium text-gray-900">{m.name}</td>
                  <td className="p-3">
                    <TypeBadge type={m.type} color={typeColors[m.type]} />
                  </td>
                  <td className="p-3 text-center font-semibold">
                    {m.quantity}
                  </td>
                  <td className="p-3 text-center">{m.unit}</td>
                  <td className="p-3 text-center text-orange-600">
                    {new Date(m.expiryDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-center">{m.threshold}</td>
                  <td className="p-3 text-center">{m.storageLocation}</td>
                  <td className="p-3 text-center">
                    <StatusBadge label={m.statusInfo.label} />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="p-2 rounded cursor-pointer hover:bg-gray-200"
                      onClick={() => setSelectedMaterial(m._id)} // 🆕 mở popup
                    >
                        <Eye size={16} className="w-4 h-4 text-gray-600 " />
                    </button>
                    <button className="p-2 rounded cursor-pointer hover:bg-blue-200"> <Edit size={16} className="w-4 h-4 text-blue-500" /></button>
                    <button className="p-2 rounded hover:bg-red-50 text-red-600 disabled:opacity-50 cursor-pointer"> <Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🆕 Popup chi tiết vật tư */}
      {selectedMaterial && (
        <MaterialDetail
          materialId={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </div>
  );
}
