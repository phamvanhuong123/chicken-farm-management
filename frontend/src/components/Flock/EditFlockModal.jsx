import React, { useState } from "react";

export default function EditFlockModal({ show, onClose, flockData, onSave }) {
  if (!show) return null;

  const breeds = ["Gà Ri", "Gà Tam Hoàng", "Gà Ai Cập"];
  const [formData, setFormData] = useState({
    ngayNhap: flockData.ngayNhap || "",
    giongGa: flockData.giongGa || "",
    soLuong: flockData.soLuong || "",
  });

  const availableBreeds = breeds.filter(b => b !== formData.giongGa);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-[420px] p-6 rounded-2xl shadow-xl animate-slideFadeIn">
        <h2 className="text-xl font-semibold text-center mb-4">
          Chỉnh sửa thông tin đàn
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Ngày nhập *</label>
            <input
              type="date"
              name="ngayNhap"
              value={formData.ngayNhap}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Giống gà *</label>
            <select
              name="giongGa"
              value={formData.giongGa}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value={formData.giongGa}>{formData.giongGa}</option>
              {availableBreeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Số lượng *</label>
            <input
              type="number"
              name="soLuong"
              value={formData.soLuong}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
