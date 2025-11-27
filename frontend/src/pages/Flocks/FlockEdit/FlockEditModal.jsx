// FlockEditModal.jsx
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

  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dropdown
  const [speciesList, setSpeciesList] = useState([]);
  const [areaList, setAreaList] = useState([]);

  // ================= LOAD DROPDOWN =================
  useEffect(() => {
    const loadSelects = async () => {
      try {
        const sp = await fetch("http://localhost:8071/v1/species").then((r) =>
          r.json()
        );
        const ar = await fetch("http://localhost:8071/v1/areas").then((r) =>
          r.json()
        );

        setSpeciesList(sp.data || []);
        setAreaList(ar.data || []);
      } catch (e) {
        console.error("Error loading dropdown", e);
      }
    };

    loadSelects();
  }, []);

  // ================= PREFILL =================
  useEffect(() => {
    if (flock) {
      reset({
        importDate: flock.importDate?.slice(0, 10),
        speciesId: flock.speciesId,
        initialCount: flock.initialCount,
        currentCount: flock.currentCount,
        avgWeight: flock.avgWeight,
        areaId: flock.areaId,
        note: flock.note || "",
        status: flock.status
      });
    }
  }, [flock, reset]);

  // ================= SUBMIT =================
  const onSubmit = async (data) => {
    setApiError("");
    setSuccessMessage("");

    const today = new Date();

    // Validate
    if (new Date(data.importDate) > today) {
      return setError("importDate", { message: "Ngày nhập không hợp lệ." });
    }

    if (Number(data.initialCount) <= 0) {
      return setError("initialCount", {
        message: "Số lượng phải lớn hơn 0."
      });
    }

    if (Number(data.avgWeight) <= 0) {
      return setError("avgWeight", {
        message: "Trọng lượng trung bình phải lớn hơn 0."
      });
    }

    // Payload
    const payload = {
      importDate: data.importDate,
      speciesId: data.speciesId,
      initialCount: Number(data.initialCount),
      currentCount: Number(data.currentCount),
      avgWeight: Number(data.avgWeight),
      areaId: data.areaId,
      note: data.note,
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

      setSuccessMessage("Cập nhật thông tin đàn thành công!");

      setTimeout(() => {
        onSaved(json.data);
        onClose();
      }, 1200);
    } catch (err) {
      setApiError(err.message || "Không thể cập nhật đàn, vui lòng thử lại.");
    }
  };

  if (!flock) return null;

  // ================= RENDER =================
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow p-6 space-y-4 relative">

        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black text-2xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold">Chỉnh sửa đàn</h2>

        {/* ERROR */}
        {apiError && (
          <div className="bg-red-100 text-red-700 border border-red-300 px-4 py-2 rounded">
            {apiError}
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="bg-green-100 text-green-700 border border-green-300 px-4 py-2 rounded">
            {successMessage}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Ngày nhập */}
          <div>
            <label className="font-medium">Ngày nhập *</label>
            <input
              type="date"
              className="border px-3 py-2 w-full rounded"
              {...register("importDate", { required: true })}
            />
            {errors.importDate && (
              <p className="text-red-500 text-sm">{errors.importDate.message}</p>
            )}
          </div>

          {/* Giống gà */}
          <div>
            <label className="font-medium">Giống gà *</label>
            <select
              className="border px-3 py-2 w-full rounded"
              {...register("speciesId", { required: true })}
            >
              <option value="">-- Chọn giống --</option>
              {speciesList.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Số lượng ban đầu */}
          <div>
            <label className="font-medium">Số lượng ban đầu *</label>
            <input
              type="number"
              className="border px-3 py-2 w-full rounded"
              {...register("initialCount", { required: true })}
            />
            {errors.initialCount && (
              <p className="text-red-500 text-sm">{errors.initialCount.message}</p>
            )}
          </div>

          {/* Số lượng hiện tại */}
          <div>
            <label className="font-medium">Số lượng hiện tại *</label>
            <input
              type="number"
              className="border px-3 py-2 w-full rounded"
              {...register("currentCount", { required: true })}
            />
          </div>

          {/* Trọng lượng TB */}
          <div>
            <label className="font-medium">Trọng lượng TB (kg) *</label>
            <input
              type="number"
              step="0.01"
              className="border px-3 py-2 w-full rounded"
              {...register("avgWeight", { required: true })}
            />
            {errors.avgWeight && (
              <p className="text-red-500 text-sm">{errors.avgWeight.message}</p>
            )}
          </div>

          {/* Khu nuôi */}
          <div>
            <label className="font-medium">Khu nuôi *</label>
            <select
              className="border px-3 py-2 w-full rounded"
              {...register("areaId", { required: true })}
            >
              <option value="">-- Chọn khu --</option>
              {areaList.map((ar) => (
                <option key={ar.id} value={ar.id}>
                  {ar.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="font-medium">Ghi chú</label>
            <textarea
              rows={3}
              className="border px-3 py-2 w-full rounded"
              {...register("note")}
            ></textarea>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="font-medium">Trạng thái *</label>
            <select
              className="border px-3 py-2 w-full rounded"
              {...register("status")}
            >
              <option value="Raising">Đang nuôi</option>
              <option value="Sold">Đã bán</option>
              <option value="Closed">Đã đóng</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Lưu thay đổi
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
