import React, { useState, useEffect } from "react";
import { areaApi } from "../../apis/areaApi";
import toast from "react-hot-toast";

function EditAreaModal({ open, onClose, area, staffList, onSuccess }) {
  // 🔥 Debug xem FE nhận đúng gì
  // console.log("👉 staffList FE nhận được:", staffList);
  // console.log("👉 area.staff từ BE:", area?.staff);
  
  if (!open || !area) return null;

  const [form, setForm] = useState({
    maxCapacity: area.maxCapacity,
    staff: area?.staff,
    status: area.status,
    note: area.note || "",
  });
console.log(form);
  // mỗi khi area thay đổi → load form
  useEffect(() => {
    setForm({
      maxCapacity: area.maxCapacity,
      staff:
        area.staff
          ?.map((s) => {
            const emp = staffList.find((e) => e.id === s.staffId);
            return emp?.id
          })
          .filter(Boolean) || [],
      status: area.status,
      note: area.note || "",
    });
  }, [area, staffList]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleStaff = (id) => {
    setForm((prev) => ({
      ...prev,
      staff: prev.staff.includes(id)
        ? prev.staff.filter((s) => s !== id)
        : [...prev.staff, id],
    }));
  };

  const handleSubmit = async () => {
    // map staff → object đúng BE yêu cầu
    const staffObjects = staffList
      .filter((st) => form.staff.includes(st.id))
      .map((st) => ({
        name: st.name,  
        staffId :st.id
      }));

    const payload = {
      name: area.name, // ⭐ BE yêu cầu name
      maxCapacity: Number(form.maxCapacity),
      staff: staffObjects, // ⭐ staff là object, không phải id
      status: form.status,
      note: form.note,
    };

    console.log("PAYLOAD GỬI BE:", payload);

    try {
      await areaApi.update(area._id, payload);

      toast.success("Cập nhật thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      console.log("Lỗi update:", err.response?.data);
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[420px] animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Chỉnh sửa khu nuôi</h2>

        {/* Tên khu (không cho sửa) */}
        <label className="font-medium">Tên khu</label>
        <input
          value={area.name}
          disabled
          className="border p-2 w-full mb-3 bg-gray-100 text-gray-500"
        />

        {/* Sức chứa */}
        <label className="font-medium">Sức chứa tối đa</label>
        <input
          type="number"
          name="maxCapacity"
          value={form.maxCapacity}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        />

        {/* Nhân viên phụ trách */}
        <label className="font-medium">Nhân viên phụ trách</label>
        <div className="border p-2 rounded max-h-32 mb-3 overflow-auto">
          {staffList.map((st) => (
            <label key={st.id} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={form.staff.includes(st.id)}
                onChange={() => toggleStaff(st.id)}
              />
              {st.name}
            </label>
          ))}
        </div>

        {/* Trạng thái */}
        <label className="font-medium">Trạng thái</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border p-2 w-full mb-3"
        >
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="EMPTY">Trống</option>
          <option value="MAINTENANCE">Bảo trì</option>
          <option value="INCIDENT">Sự cố</option>
        </select>

        {/* Ghi chú */}
        <label className="font-medium">Ghi chú</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="border p-2 w-full mb-4"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
            Hủy
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSubmit}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditAreaModal;
