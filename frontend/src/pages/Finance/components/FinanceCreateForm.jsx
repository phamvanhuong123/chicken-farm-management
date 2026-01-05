import React, { useState, useEffect } from "react";
import { financeApi } from "../../../apis/financeApi";
import { flockApi } from "../../../apis/flockApi";
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
  const [flocks, setFlocks] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchFlocks();
  }, []);

  const fetchFlocks = async () => {
    try {
      const response = await flockApi.getList();

      // Xử lý dữ liệu từ API
      let flocksData = [];

      if (Array.isArray(response.data)) {
        flocksData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        flocksData = response.data.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        flocksData = response.data.items;
      } else if (response.data && Array.isArray(response.data.results)) {
        flocksData = response.data.results;
      }

      setFlocks(flocksData);

    } catch (err) {
      console.error("Lỗi khi lấy danh sách đàn:", err);
      toast.error("Không thể tải danh sách đàn");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError("");

    const { date, type, category, amount, description } = form;

    if (!date || !type || !category || !amount || !description) {
      setFormError("Vui lòng điền đầy đủ các trường bắt buộc");
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    if (Number(amount) <= 0) {
      setFormError("Số tiền phải lớn hơn 0");
      toast.error("Số tiền phải lớn hơn 0");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        date,
        type,
        category,
        amount: Number(amount),
        flockId: form.flockId || null,
        description: description.trim(),
      };

      await financeApi.createTransaction(payload);

      toast.success("Thêm giao dịch thành công!");
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Lỗi:", err);

      let errorMessage = "Thêm giao dịch thất bại. Vui lòng thử lại.";

      if (err.response?.data) {
        const errorData = err.response.data;

        if (typeof errorData === 'object' && errorData.errors) {
          setErrors(errorData.errors);

          const errorMessages = [];
          Object.entries(errorData.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            } else {
              errorMessages.push(messages);
            }
          });

          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
            setFormError(`Có lỗi xảy ra: ${errorMessages.slice(0, 3).join(', ')}${errorMessages.length > 3 ? '...' : ''}`);
          }
        }
        else if (errorData.message) {
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : errorData.message;
          errorMessage = message;
          setFormError(message);
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1">
          {Array.isArray(errors[fieldName])
            ? errors[fieldName].join(', ')
            : errors[fieldName]}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-[760px] max-h-[90vh] overflow-y-auto p-6 shadow-lg">
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

        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-700 font-medium">Không thể thêm giao dịch</p>
                <p className="text-red-600 text-sm mt-1">{formError}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Ngày giao dịch <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
                required
              />
              {renderFieldError('date')}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Loại giao dịch <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={form.type}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại</option>
                <option value="income">Thu</option>
                <option value="expense">Chi</option>
              </select>
              {renderFieldError('type')}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
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
              {renderFieldError('category')}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Số tiền (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                placeholder="Ví dụ: 1500000"
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
                min="1"
                required
              />
              {renderFieldError('amount')}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Đàn liên quan
              </label>
              <span className="text-xs text-gray-400 mb-2">Không bắt buộc</span>
              <select
                name="flockId"
                value={form.flockId}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.flockId ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
              >
                <option value="">-- Không chọn --</option>
                {flocks.length > 0 ? (
                  flocks.map((flock) => {
                    const id = flock.id || flock._id;
                    const name = flock.name || flock.flockName || `Đàn #${id}`;
                    const breed = flock.breed ? ` - ${flock.breed}` : '';

                    return (
                      <option key={id} value={id}>
                        {name}{breed}
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>Không có đàn nào</option>
                )}
              </select>
              {renderFieldError('flockId')}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Số hóa đơn
              </label>
              <input
                disabled
                placeholder="Tự động sinh"
                className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

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
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                onChange={handleChange}
                required
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">
                  {form.description.length}/500 ký tự
                </span>
                {renderFieldError('description')}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang thêm...
                </>
              ) : "Thêm giao dịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FinanceCreateForm;