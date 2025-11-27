// Flocks.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Eye, Edit } from "lucide-react";
import FlockDelete from "./FlockDelete/FlockDelete";
import Statistical from "./Statistical/Statistical";
import HeaderFlock from "./HeaderFlock/HeaderFlock";
import FilterFlock from "./FilterFlock/FilterFlock";
import FlockEditModal from "./FlockEdit/FlockEditModal";

// Component FlockRow (KHÔNG ĐỤNG)
const FlockRow = ({
  flock,
  index,
  formatDate,
  getStatusBadge,
  onView,
  onEdit,
  onDelete,
  setFlocks
}) => {
  return (
    <tr
      key={flock._id}
      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
    >
      <td className="px-4 py-2">{flock.code || "-"}</td>
      <td className="px-4 py-2">
        {flock.createdAt ? formatDate(flock.createdAt) : "-"}
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
      <td className="px-4 py-2 text-center">
        {getStatusBadge(flock.status)}
      </td>

      <td className="px-4 py-2 text-center flex justify-center gap-2">
        <button
          className="p-2 rounded hover:bg-gray-200"
          title="Xem chi tiết"
          onClick={() => onView(flock._id)}
        >
          <Eye size={16} className="w-4 h-4 text-gray-600" />
        </button>

        <button
          className="p-2 rounded hover:bg-blue-200"
          title="Chỉnh sửa"
          onClick={() => onEdit(flock._id)}
        >
          <Edit size={16} className="w-4 h-4 text-blue-500" />
        </button>

        <FlockDelete
          flock={flock}
          onDeleted={(id) =>
            setFlocks((prev) => prev.filter((x) => x._id !== id))
          }
        />
      </td>
    </tr>
  );
};

function Flocks() {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecies, setFilterSpecies] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  // STATE mở Modal Edit bằng LOG
  const [editingFlock, setEditingFlock] = useState(null);

  // Gọi API
  useEffect(() => {
    const fetchFlocks = async () => {
      try {
        const res = await axios.get("http://localhost:8071/v1/flocks");
        setFlocks(res.data.data || []);
      } catch (err) {
        console.error("Lỗi tải danh sách đàn:", err);
        setFlocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlocks();
  }, []);

  // ⭐⭐ LISTEN TO EDIT-LOG → tự bật modal ⭐⭐
  useEffect(() => {
    const originalLog = console.log;

    console.log = (...args) => {
      originalLog(...args);

      if (typeof args[0] === "string" && args[0].includes("✏️ Chỉnh sửa đàn:")) {
        const id = args[1];
        const found = flocks.find((f) => f._id === id);
        setEditingFlock(found);
      }
    };

    return () => {
      console.log = originalLog; // cleanup
    };
  }, [flocks]);

  // ================= FILTER =================
  const filteredFlocks = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return flocks.filter((flock) => {
      const s1 =
        filterStatus === "all" ||
        (filterStatus === "Raising" &&
          ["Raising", "Đang nuôi"].includes(flock.status)) ||
        (filterStatus === "Sold" &&
          ["Sold", "Đã bán"].includes(flock.status)) ||
        flock.status === filterStatus;

      const s2 =
        filterSpecies === "all" || flock.speciesId === filterSpecies;

      const s3 = (flock.code || "").toLowerCase().includes(lower);

      return s1 && s2 && s3;
    });
  }, [flocks, filterStatus, filterSpecies, searchTerm]);

  const allSpecies = useMemo(() => {
    return [...new Set(flocks.map((f) => f.speciesId).filter(Boolean))];
  }, [flocks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterSpecies, searchTerm]);

  // ================= FORMAT =================
  const formatDate = (str) => {
    const d = new Date(str);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 text-xs rounded ${
        ["Raising", "Đang nuôi"].includes(status)
          ? "bg-green-100 text-green-800"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      {status === "Raising" ? "Đang nuôi" : status === "Sold" ? "Đã bán" : status}
    </span>
  );

  // ================= PAGING =================
  const totalPages = Math.ceil(filteredFlocks.length / rowsPerPage) || 1;

  const currentFlocks = filteredFlocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ================= HANDLERS =================
  const handleView = (id) =>
    console.log("👁️ Xem chi tiết đàn:", id);

  // ⭐ Bạn muốn để handleEdit ĐÚNG 1 dòng, và modal vẫn mở
  const handleEdit = (id) => {
    console.log("✏️ Chỉnh sửa đàn:", id);
  };

  const handleDelete = (id) =>
    console.log("🗑️ Xóa đàn:", id);

  // Sau khi sửa đàn → cập nhật bảng
  const handleSaved = (updated) => {
    setFlocks((prev) =>
      prev.map((f) => (f._id === updated._id ? updated : f))
    );
  };

  // ================= UI =================
  return (
    <div className="px-8 mt-8">
      <HeaderFlock />

      <Statistical flocks={filteredFlocks} />

      <FilterFlock
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterSpecies={filterSpecies}
        onSpeciesChange={setFilterSpecies}
        allSpecies={allSpecies}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : flocks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có dữ liệu đàn gà.
          </div>
        ) : filteredFlocks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Không tìm thấy đàn gà nào khớp.
          </div>
        ) : (
          <>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Mã lứa</th>
                  <th className="px-4 py-2">Ngày nhập</th>
                  <th className="px-4 py-2">Giống</th>
                  <th className="px-4 py-2 text-center">SL ban đầu</th>
                  <th className="px-4 py-2 text-center">SL hiện tại</th>
                  <th className="px-4 py-2 text-center">TL TB</th>
                  <th className="px-4 py-2 text-center">Trạng thái</th>
                  <th className="px-4 py-2 text-center">Hành động</th>
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
                    setFlocks={setFlocks}
                  />
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-amber-200"
                >
                  Quay lại
                </button>

                <span>
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, totalPages)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-amber-200"
                >
                  Trang tiếp
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ⭐ MODAL EDIT */}
      {editingFlock && (
        <FlockEditModal
          flock={editingFlock}
          onClose={() => setEditingFlock(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Flocks;
