// 🧾 MaterialDetail.jsx — TEAM-104
import React, { useEffect, useState } from "react";
import { materialAPI } from "~/apis/material.api";
import { toast } from "react-hot-toast";

export default function MaterialDetail({ materialId, onClose }) {
  const [material, setMaterial] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await materialAPI.getById(materialId);
        if (!res.data?.data) throw new Error("Không tìm thấy thông tin vật tư");
        setMaterial(res.data.data);
        setHistory(res.data.data.importHistory || []);
      } catch (err) {
        toast.error(err.message || "Lỗi tải dữ liệu vật tư");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [materialId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow text-center w-96">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow text-center w-96">
          <p className="text-gray-600 italic">
            Không tìm thấy thông tin vật tư.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 space-y-4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold mb-3">Chi tiết vật tư</h2>

        {/* 🧱 Thông tin vật tư */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <p>
            <b>Tên vật tư:</b> {material.name}
          </p>
          <p>
            <b>Loại vật tư:</b> {material.type}
          </p>
          <p>
            <b>Đơn vị:</b> {material.unit}
          </p>
          <p>
            <b>Số lượng tồn:</b> {material.quantity}
          </p>
          <p>
            <b>Ngưỡng cảnh báo:</b> {material.threshold}
          </p>
          <p>
            <b>Ngày nhập gần nhất:</b>{" "}
            {material.lastImportDate
              ? new Date(material.lastImportDate).toLocaleDateString("vi-VN")
              : "-"}
          </p>
          <p>
            <b>Hạn sử dụng:</b>{" "}
            {material.expiryDate
              ? new Date(material.expiryDate).toLocaleDateString("vi-VN")
              : "-"}
          </p>
          <p>
            <b>Giá (VNĐ):</b> {material.price?.toLocaleString() || 0}
          </p>
          <p>
            <b>Vị trí lưu trữ:</b> {material.storageLocation || "-"}
          </p>
          <p>
            <b>Nhà cung cấp:</b> {material.supplier || "-"}
          </p>
        </div>

        {/* 🧾 Lịch sử nhập */}
        <h3 className="text-lg font-semibold mt-4">Lịch sử nhập vật tư</h3>
        {history.length === 0 ? (
          <p className="italic text-gray-500">Chưa có lịch sử nhập.</p>
        ) : (
          <table className="w-full text-sm border mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Ngày nhập</th>
                <th className="p-2 text-right">Số lượng</th>
                <th className="p-2 text-left">Nhà cung cấp</th>
                <th className="p-2 text-right">Giá nhập (VNĐ)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    {new Date(h.date).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-2 text-right">{h.quantity}</td>
                  <td className="p-2">{h.supplier}</td>
                  <td className="p-2 text-right">
                    {h.price?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* 🔘 Nút đóng */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
