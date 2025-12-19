import React, { useState } from "react";
import { financeApi } from "../../../apis/financeApi";

function FinanceCreateForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    financeDate: "",
    type: "",
    category: "",
    amount: "",
    flockId: "",
    description: "",
    invoiceNumber: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { financeDate, type, category, amount, description } = form;

    if (!financeDate || !type || !category || !amount || !description) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (new Date(financeDate) > new Date()) {
      alert("Ngày giao dịch không hợp lệ.");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Số tiền phải lớn hơn 0.");
      return;
    }

    try {
      await financeApi.create({
        ...form,
        amount: Number(amount),
        flockId: form.flockId || null,
      });
      onSuccess();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Không thể thêm giao dịch, vui lòng thử lại."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-[760px] p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Thêm giao dịch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          {/* Ngày giao dịch */}
          <div className="flex flex-col">
            <label className="label">
              Ngày giao dịch <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="financeDate"
              className="input"
              onChange={handleChange}
            />
          </div>

          {/* Loại giao dịch */}
          <div className="flex flex-col">
            <label className="label">
              Loại giao dịch <span className="text-red-500">*</span>
            </label>
            <select name="type" className="input" onChange={handleChange}>
              <option value="">Chọn loại</option>
              <option value="Thu">Thu</option>
              <option value="Chi">Chi</option>
            </select>
          </div>

          {/* Danh mục */}
          <div className="flex flex-col">
            <label className="label">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select name="category" className="input" onChange={handleChange}>
              <option value="">Chọn danh mục</option>
              <option>Thức ăn</option>
              <option>Thuốc</option>
              <option>Nhân công</option>
              <option>Điện nước</option>
              <option>Bán hàng</option>
              <option>Khác</option>
            </select>
          </div>

          {/* Số tiền */}
          <div className="flex flex-col">
            <label className="label">
              Số tiền (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              placeholder="Ví dụ: 1.500.000"
              className="input"
              onChange={handleChange}
            />
          </div>

          {/* Đàn liên quan */}
          <div className="flex flex-col">
            <label className="label">Đàn liên quan</label>
            <span className="text-xs text-gray-400 mb-1">Không bắt buộc</span>
            <input
              name="flockId"
              placeholder="Chọn hoặc để trống"
              className="input"
              onChange={handleChange}
            />
          </div>

          {/* Số hóa đơn */}
          <div className="flex flex-col">
            <label className="label">Số hóa đơn</label>
            <input
              name="invoiceNumber"
              placeholder="Ví dụ: HD-001"
              className="input"
              onChange={handleChange}
            />
          </div>

          {/* Mô tả */}
          <div className="flex flex-col col-span-2">
            <label className="label">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              maxLength={255}
              placeholder="Nhập mô tả giao dịch"
              className="input resize-none"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Thêm giao dịch
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinanceCreateForm;
