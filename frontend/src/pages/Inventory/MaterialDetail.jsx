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
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết vật tư</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8 text-sm">
          {/* INFO CARDS */}
          <div className="grid grid-cols-2 gap-6">
            <InfoCard label="Tên vật tư" value={material.name} />
            <InfoCard label="Loại vật tư" value={material.type} />
            <InfoCard label="Đơn vị" value={material.unit} />
            <InfoCard label="Số lượng tồn" value={material.quantity} />
            <InfoCard label="Ngưỡng cảnh báo" value={material.threshold} />
            <InfoCard
              label="Hạn sử dụng"
              value={
                material.expiryDate
                  ? new Date(material.expiryDate).toLocaleDateString("vi-VN")
                  : "-"
              }
            />
            <InfoCard
              label="Vị trí lưu trữ"
              value={material.storageLocation || "-"}
            />
            <InfoCard label="Nhà cung cấp" value={material.supplier || "-"} />
          </div>

          {/* HISTORY */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Lịch sử nhập kho
            </h3>

            {history.length === 0 ? (
              <div className="text-gray-500 italic">Chưa có lịch sử nhập.</div>
            ) : (
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Ngày nhập</th>
                      <th className="px-4 py-3 text-right">Số lượng</th>
                      <th className="px-4 py-3 text-left">Nhà cung cấp</th>
                      <th className="px-4 py-3 text-right">Giá nhập</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr
                        key={i}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3">
                          {new Date(h.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {h.quantity}
                        </td>
                        <td className="px-4 py-3">{h.supplier || "-"}</td>
                        <td className="px-4 py-3 text-right">
                          {h.price?.toLocaleString() || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end px-8 py-5 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  function InfoCard({ label, value }) {
    return (
      <div className="rounded-xl border bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-base font-semibold text-gray-800">{value}</p>
      </div>
    );
  }
}
