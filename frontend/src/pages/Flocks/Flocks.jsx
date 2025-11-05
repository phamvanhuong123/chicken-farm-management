import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Edit, Trash2 } from "lucide-react";

// ✅ Component con — hiển thị 1 dòng đàn gà
const FlockRow = ({
  flock,
  index,
  formatDate,
  getStatusBadge,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <tr key={flock._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
      <td className="px-4 py-2">{flock.code || "-"}</td>
      <td className="px-4 py-2">
        {flock.importDate ? formatDate(flock.importDate) : "-"}
      </td>
      <td className="px-4 py-2">{flock.speciesId || "-"}</td>
      <td className="px-4 py-2 text-center">
        {flock.initialCount?.toLocaleString() || 0}
      </td>
      <td className="px-4 py-2 text-center">
        {flock.currentCount?.toLocaleString() || 0}
      </td>
      <td className="px-4 py-2 text-center">
        {flock.avgWeight?.toFixed(1) || 0}
      </td>
      <td className="px-4 py-2 text-center">{getStatusBadge(flock.status)}</td>
      <td className="px-4 py-2 text-center flex justify-center gap-2">
        <button title="Xem chi tiết" onClick={() => onView(flock._id)}>
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
        <button title="Chỉnh sửa" onClick={() => onEdit(flock._id)}>
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button title="Xóa" onClick={() => onDelete(flock._id)}>
          <Trash2 className="w-4 h-4 text-gray-600" />
        </button>
      </td>
    </tr>
  );
};

// ✅ Component chính — trang danh sách đàn
function Flocks() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Gọi API lấy danh sách đàn
  useEffect(() => {
    const fetchFlocks = async () => {
      try {
        const res = await axios.get("http://localhost:8071/v1/flocks");
        setFlocks(res.data.data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách đàn:", error);
        setFlocks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFlocks();
  }, []);

  // Format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Badge trạng thái
  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${
        status === "Raising" || status === "Đang nuôi"
          ? "bg-green-100 text-green-800"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      {status === "Raising"
        ? "Đang nuôi"
        : status === "Sold"
        ? "Đã bán"
        : status}
    </span>
  );

  // Phân trang
  const totalPages = Math.ceil(flocks.length / rowsPerPage);
  const currentFlocks = flocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

    if (editing.current < 0 || editing.current > editing.initial) {
      alert("Số lượng hiện tại không hợp lệ!");
      return;
    }

    if (!editing.avgWeight || !/^\d+(\.\d+)?kg$/.test(editing.avgWeight)) {
      alert("Trọng lượng trung bình phải có định dạng số + 'kg' (VD: 2.1kg)");
      return;
    }

    // Cập nhật vào danh sách
    setFlocks((prev) =>
      prev.map((f) => (f.id === editing.id ? editing : f))
    );

    alert("Cập nhật thông tin đàn thành công!");
    setEditing(null);
  };

  // Xử lý sự kiện
  const handleView = (id) => console.log("👁️ Xem chi tiết đàn:", id);
  const handleEdit = (id) => console.log("✏️ Chỉnh sửa đàn:", id);
  const handleDelete = (id) => console.log("🗑️ Xóa đàn:", id);

  return (
    <div className="p-6 space-y-6">
      {/* --- Thống kê --- */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tổng số đàn</p>
          <h2 className="text-2xl font-bold text-green-700">{flocks.length}</h2>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Đàn đang nuôi</p>
          <h2 className="text-2xl font-bold text-blue-700">
            {flocks.filter((f) => f.status === "Đang nuôi").length}
          </h2>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Trọng lượng TB</p>
          <h2 className="text-2xl font-bold text-purple-700">1.9kg</h2>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tỷ lệ chết TB</p>
          <h2 className="text-2xl font-bold text-orange-700">2.1%</h2>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : flocks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có dữ liệu đàn gà.
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-sm font-semibold">Mã lứa</th>
                  <th className="px-4 py-2 text-sm font-semibold">Ngày nhập</th>
                  <th className="px-4 py-2 text-sm font-semibold">Giống</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">
                    SL ban đầu
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">
                    SL hiện tại
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">
                    TL TB (kg/con)
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">
                    Trạng thái
                  </th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentFlocks.map((flock, index) => (
                  <FlockRow
                    key={flock._id}
                    flock={flock}
                    index={index}
                    formatDate={formatDate}
                    getStatusBadge={getStatusBadge}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-4 py-3 border-t text-sm text-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded disabled:opacity-50 ${
                  currentPage !== 1
                    ? "hover:bg-amber-200 transition cursor-pointer"
                    : ""
                }`}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
