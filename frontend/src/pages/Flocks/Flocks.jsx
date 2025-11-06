import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, Edit, Trash2, X } from "lucide-react";
import Statistical from "./Statistical";
import FlockDeleteHandler from "./FlockDelete";
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
        <button title="Chỉnh sửa" onClick={() => onEdit(flock)}>
          <Edit className="w-4 h-4 text-gray-600" />
        </button>
         <FlockDeleteHandler
          flock={flock}
          onDeleted={(id) => console.log("✅ Đã xóa đàn:", id)}
        />
      </td>
    </tr>
  );
};

// ✅ Component chính — trang danh sách đàn
function Flocks() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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

  // Gọi API lấy danh sách đàn
  useEffect(() => {
    const fetchFlocks = async () => {
      try {
        const res = await axios.get("http://localhost:8071/v1/flocks");
        console.log(res)
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

  // Phân trang
  const totalPages = Math.ceil(flocks.length / rowsPerPage);
  const currentFlocks = flocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ====== XỬ LÝ SỰ KIỆN ======
  const handleView = (id) => alert(`👁️ Xem chi tiết đàn ID: ${id}`);

  const handleEdit = (flock) => {
    setEditing({ ...flock });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa đàn này không?")) {
      setFlocks((prev) => prev.filter((f) => f._id !== id));
      alert("🗑️ Đã xóa đàn thành công!");
    }
  };

  const handleUpdateFlock = () => {
    if (editing.currentCount < 0 || editing.currentCount > editing.initialCount) {
      alert("❌ Số lượng hiện tại không hợp lệ!");
      return;
    }

    if (!editing.avgWeight || isNaN(editing.avgWeight)) {
      alert("❌ Trọng lượng trung bình phải là số!");
      return;
    }

    setFlocks((prev) =>
      prev.map((f) => (f._id === editing._id ? editing : f))
    );

    alert("✅ Cập nhật thông tin đàn thành công!");
    setEditing(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Danh sách đàn</h2>
      <Statistical flocks={flocks}/>
      {loading ? (
        <p>Đang tải...</p>
      ) : flocks?.length === 0 ? (
        <p>Không có đàn nào.</p>
      ) : (
        <div className="mt-10">
          <table className="w-full border-none">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2">Mã đàn</th>
                <th className="px-4 py-2">Ngày nhập</th>
                <th className="px-4 py-2">Giống</th>
                <th className="px-4 py-2">Số lượng nhập</th>
                <th className="px-4 py-2">Số lượng hiện tại</th>
                <th className="px-4 py-2">Trọng lượng TB</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Hành động</th>
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

          {/* Phân trang */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ← Trước
            </button>
            <span className="px-2 py-1">
              Trang {currentPage}/{totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa */}
      {editing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
            <button
              className="absolute top-2 right-2 text-gray-500"
              onClick={() => setEditing(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa đàn</h3>

            <div className="flex flex-col gap-3">
              <label>
                Số lượng hiện tại:
                <input
                  type="number"
                  value={editing.currentCount || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, currentCount: + e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </label>
              <label>
                Trọng lượng trung bình (kg):
                <input
                  type="number"
                  step="0.1"
                  value={editing.avgWeight || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, avgWeight: +e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditing(null)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateFlock}
                className="px-3 py-1 bg-blue-500 text-white rounded"
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

export default Flocks;
