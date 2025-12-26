import React, { useState } from "react";
import { financeApi } from "../../../apis/financeApi";
import toast from "react-hot-toast";

function FinanceCreateForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    date: "",
    type: "",
    category: "",
    amount: "",
    flockId: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { date, type, category, amount, description } = form;

    // Validation
    if (!date || !type || !category || !amount || !description) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (new Date(date) > new Date()) {
      toast.error("Ngày giao dịch không hợp lệ.");
      return;
    }

    if (Number(amount) <= 0) {
      toast.error("Số tiền phải lớn hơn 0.");
      return;
    }

    setLoading(true);

    try {
      await financeApi.createTransaction({
        date,
        type,
        category,
        amount: Number(amount),
        flockId: form.flockId || null,
        description: description.trim(),
      });

      toast.success("Thêm giao dịch thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating transaction:", err);
      toast.error(
        err?.response?.data?.message ||
          "Không thể thêm giao dịch, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-[760px] max-h-[90vh] overflow-y-auto p-6 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Thêm giao dịch
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Ngày giao dịch */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Ngày giao dịch <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              />
            </div>

            {/* Loại giao dịch */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Loại giao dịch <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại</option>
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>
            </div>

            {/* Danh mục */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="Thức ăn">Thức ăn</option>
                <option value="Thuốc">Thuốc</option>
                <option value="Nhân công">Nhân công</option>
                <option value="Điện nước">Điện nước</option>
                <option value="Bán hàng">Bán hàng</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Số tiền */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Số tiền (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                placeholder="Ví dụ: 1500000"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {/* Đàn liên quan */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Đàn liên quan
              </label>
              <span className="text-xs text-gray-400 mb-2">Không bắt buộc</span>
              <input
                name="flockId"
                value={form.flockId}
                placeholder="Chọn hoặc để trống"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
            </div>

            {/* Số hóa đơn */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Số hóa đơn
              </label>
              <input
                disabled
                placeholder="Tự động sinh"
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"

                // name="invoiceCode"
                // value={form.invoiceCode}
                // placeholder="Ví dụ: HD-001"
                // className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                // onChange={handleChange}
              />
            </div>

            {/* Mô tả */}
            <div className="flex flex-col col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                rows={4}
                maxLength={500}
                placeholder="Nhập mô tả giao dịch"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                onChange={handleChange}
                required
              />
              <span className="text-xs text-gray-400 mt-1">
                {form.description.length}/500 ký tự
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinanceCreateForm;
