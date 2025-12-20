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
    storageLocation: "",
  });

  // ✅ TÁCH RÕ 2 LOADING
  const [loadingDetail, setLoadingDetail] = useState(false); // load dữ liệu cũ
  const [submitting, setSubmitting] = useState(false); // bấm Lưu

  const [errors, setErrors] = useState({});

  // ===============================
  // 🔹 LOAD DỮ LIỆU VẬT TƯ CŨ
  // ===============================
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
          storageLocation: data.storageLocation || "",
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

  // ===============================
  // 🔹 HANDLE CHANGE
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // 🔹 VALIDATE
  // ===============================
  const validate = () => {
    const newErrors = {};

    if (!form.name) newErrors.name = "Vui lòng nhập tên vật tư";
    if (!form.type) newErrors.type = "Vui lòng nhập loại vật tư";
    if (!form.unit) newErrors.unit = "Vui lòng nhập đơn vị";
    if (form.quantity === "" || Number(form.quantity) < 0)
      newErrors.quantity = "Số lượng phải ≥ 0";
    if (!form.expiryDate) newErrors.expiryDate = "Vui lòng chọn hạn sử dụng";
    if (!form.storageLocation)
      newErrors.storageLocation = "Vui lòng nhập vị trí lưu trữ";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===============================
  // 🔹 SUBMIT UPDATE
  // ===============================
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
          <h2 className="text-xl font-semibold text-gray-800">✏️ Sửa vật tư</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
          {/* Tên */}
          <div className="col-span-2">
            <label className="label">Tên vật tư *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
            />
            {errors.name && <p className="error">{errors.name}</p>}
          </div>

          {/* Loại */}
          <div>
            <label className="label">Loại *</label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              className="input"
              placeholder="Ví dụ: Vaccine"
            />
            {errors.type && <p className="error">{errors.type}</p>}
          </div>

          {/* Đơn vị */}
          <div>
            <label className="label">Đơn vị *</label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="input"
              placeholder="Ví dụ: lọ, kg"
            />
            {errors.unit && <p className="error">{errors.unit}</p>}
          </div>

          {/* Số lượng */}
          <div>
            <label className="label">Số lượng *</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="input"
            />
            {errors.quantity && <p className="error">{errors.quantity}</p>}
          </div>

          {/* Ngưỡng */}
          <div>
            <label className="label">Ngưỡng cảnh báo</label>
            <input
              type="number"
              name="threshold"
              value={form.threshold}
              onChange={handleChange}
              className="input"
            />
          </div>

          {/* HSD */}
          <div>
            <label className="label">Hạn sử dụng *</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate}
              onChange={handleChange}
              className="input"
            />
            {errors.expiryDate && <p className="error">{errors.expiryDate}</p>}
          </div>

          {/* Vị trí */}
          <div>
            <label className="label">Vị trí lưu trữ *</label>
            <input
              name="storageLocation"
              value={form.storageLocation}
              onChange={handleChange}
              className="input"
              placeholder="Ví dụ: Kho lạnh 01"
            />
            {errors.storageLocation && (
              <p className="error">{errors.storageLocation}</p>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100"
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
