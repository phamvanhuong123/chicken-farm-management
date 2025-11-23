import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function FlockEditModal({ flock, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError
  } = useForm();

  // State hiển thị lỗi + thành công
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (flock) {
      reset({
        currentCount: flock.currentCount,
        avgWeight: flock.avgWeight?.toString().replace(",", "."),
        status: flock.status
      });
    }
  }, [flock, reset]);

  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");

    if (Number(data.currentCount) < 0) {
      return setError("currentCount", {
        message: "Số lượng hiện tại phải >= 0"
      });
    }

    if (Number(data.avgWeight) < 0) {
      return setError("avgWeight", {
        message: "Trọng lượng phải >= 0"
      });
    }

    const payload = {
      currentCount: Number(data.currentCount),
      avgWeight: Number(data.avgWeight),
      status: data.status
    };

    try {
      const res = await fetch(`http://localhost:8071/v1/flocks/${flock._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message);

      // Success message UI
      setSuccessMessage("Cập nhật đàn thành công!");

      // Tự đóng modal sau 1.2s
      setTimeout(() => {
        onSaved(json.data);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setApiError(err.message || "Không thể cập nhật đàn. Vui lòng thử lại.");
    }
  };

  if (!flock) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow p-4">

        <h2 className="text-lg font-bold mb-4">Chỉnh sửa đàn</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* HIỂN THỊ LỖI API */}
          {apiError && (
            <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded">
              {apiError}
            </div>
          )}

          {/* HIỂN THỊ THÀNH CÔNG */}
          {successMessage && (
            <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded">
              {successMessage}
            </div>
          )}

          {/* SL hiện tại */}
          <div>
            <label>SL hiện tại *</label>
            <input
              type="number"
              min="0"
              className="border px-3 py-2 w-full rounded"
              {...register("currentCount", { required: true })}
            />
            {errors.currentCount && (
              <p className="text-red-500">{errors.currentCount.message}</p>
            )}
          </div>

          {/* TL TB */}
          <div>
            <label>Trọng lượng TB (kg/con) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="border px-3 py-2 w-full rounded"
              {...register("avgWeight", { required: true })}
            />
            {errors.avgWeight && (
              <p className="text-red-500">{errors.avgWeight.message}</p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label>Trạng thái *</label>
            <select
              className="border px-3 py-2 w-full rounded"
              {...register("status")}
            >
              <option value="Raising">Đang nuôi</option>
              <option value="Sold">Đã bán</option>
              <option value="Closed">Đã đóng</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded">
              Hủy
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              Lưu thay đổi
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
