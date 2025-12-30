// EditMaterialModal.jsx — TEAM-SUA-VAT-TU (FIXED FULL)
import React, { useEffect, useState } from "react";
import { materialAPI } from "~/apis/material.api";
import { toast } from "react-hot-toast";

export default function EditMaterialModal({ materialId, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    threshold: "",
  });

  const [loadingDetail, setLoadingDetail] = useState(false); // load dữ liệu cũ
  const [submitting, setSubmitting] = useState(false); // bấm Lưu

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!materialId) return;

    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);

        const res = await materialAPI.getById(materialId);
        const data = res.data.data;

        setForm({
          name: data.name || "",
          type: data.type || "",
          quantity: data.quantity ?? "",
          unit: data.unit || "",
          expiryDate: data.expiryDate ? data.expiryDate.slice(0, 10) : "",
          threshold: data.threshold ?? "",
        });
      } catch (error) {
        toast.error("Không thể tải dữ liệu vật tư.");
        onClose();
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [materialId, onClose]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Vui lòng nhập tên vật tư";
    if (!form.type) newErrors.type = "Vui lòng nhập loại vật tư";
    if (!form.unit) newErrors.unit = "Vui lòng nhập đơn vị";
    if (form.quantity === "" || Number(form.quantity) < 0)
      newErrors.quantity = "Số lượng phải ≥ 0";
    if (!form.expiryDate) newErrors.expiryDate = "Vui lòng chọn hạn sử dụng";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      await materialAPI.update(materialId, {
        ...form,
        quantity: Number(form.quantity),
        threshold: Number(form.threshold) || 0,
      });

      toast.success("Cập nhật vật tư thành công");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật vật tư."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ===============================
  // 🔹 LOADING DETAIL
  // ===============================
  if (loadingDetail) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  // ===============================
  // 🔹 UI
  // ===============================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800"> Sửa vật tư</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Tên vật tư */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-gray-600 font-medium">
              Tên vật tư <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Vaccine Newcastle"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Loại */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">
              Loại <span className="text-red-500">*</span>
            </label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Thức ăn / Vaccine"
            />
            {errors.type && (
              <p className="text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Đơn vị */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">
              Đơn vị <span className="text-red-500">*</span>
            </label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="kg / lọ / bao"
            />
            {errors.unit && (
              <p className="text-xs text-red-500">{errors.unit}</p>
            )}
          </div>

          {/* Số lượng */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.quantity && (
              <p className="text-xs text-red-500">{errors.quantity}</p>
            )}
          </div>

          {/* Ngưỡng cảnh báo */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">Ngưỡng cảnh báo</label>
            <input
              type="number"
              name="threshold"
              value={form.threshold}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hạn sử dụng */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 font-medium">
              Hạn sử dụng <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="h-10 px-3 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expiryDate && (
              <p className="text-xs text-red-500">{errors.expiryDate}</p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-10 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300
      hover:bg-gray-100"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white
      hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
