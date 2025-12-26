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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">
            Chi tiết vật tư
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Tên vật tư" value={material.name} />
            <InfoItem label="Loại vật tư" value={material.type} />
            <InfoItem label="Đơn vị" value={material.unit} />
            <InfoItem label="Số lượng tồn" value={material.quantity} />
            <InfoItem label="Ngưỡng cảnh báo" value={material.threshold} />
            <InfoItem
              label="Hạn sử dụng"
              value={
                material.expiryDate
                  ? new Date(material.expiryDate).toLocaleDateString("vi-VN")
                  : "-"
              }
            />
            <InfoItem
              label="Vị trí lưu trữ"
              value={material.storageLocation || "-"}
            />
            <InfoItem label="Nhà cung cấp" value={material.supplier || "-"} />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🔹 ITEM HIỂN THỊ GỌN */
function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border p-3 bg-white">
      <p className="text-[11px] text-gray-400 uppercase mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}
