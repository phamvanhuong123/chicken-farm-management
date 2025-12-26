import React, { useState } from "react";
import swal from "sweetalert";
import { createArea } from "../../../services/areaService";

function CreateAreaModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    maxCapacity: "",
    status: "ACTIVE",
    note: "",
  });

  if (!open) return null;

  const update = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate FE
    if (!form.name.trim()) {
      swal("Vui lòng nhập tên khu");
      return;
    }
    if (!form.maxCapacity) {
      swal("Vui lòng nhập sức chứa");
      return;
    }
    if (Number(form.maxCapacity) <= 0) {
      swal("Sức chứa phải lớn hơn 0");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        maxCapacity: Number(form.maxCapacity),
        staff: [], // 👈 KHÔNG dùng StaffSelect
        status: form.status,
        note: form.note || "",
      };

      await createArea(payload);

      swal("Thêm khu nuôi thành công!");
      onClose();
      onSuccess(); // reload lại danh sách
    } catch (err) {
      swal(
        err?.response?.data?.message ||
          "Không thể thêm khu nuôi, vui lòng thử lại."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] rounded-lg p-6 shadow-lg animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Thêm khu nuôi mới</h2>

        <div className="space-y-4">
          {/* Tên khu */}
          <div>
            <label className="block font-medium mb-1">Tên khu *</label>
            <input
              className="w-full p-2 border rounded-md"
              placeholder="Nhập tên khu nuôi..."
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          {/* Sức chứa tối đa */}
          <div>
            <label className="block font-medium mb-1">Sức chứa tối đa *</label>
            <input
              type="number"
              className="w-full p-2 border rounded-md"
              placeholder="Nhập sức chứa..."
              value={form.maxCapacity}
              onChange={(e) => update("maxCapacity", e.target.value)}
            />
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block font-medium mb-1">Trạng thái *</label>
            <select
              className="w-full p-2 border rounded-md"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="EMPTY">Trống</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INCIDENT">Sự cố</option>
            </select>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block font-medium mb-1">Ghi chú</label>
            <textarea
              rows="3"
              className="w-full p-2 border rounded-md"
              placeholder="Nhập ghi chú (không bắt buộc)"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAreaModal;
