// Flocks.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Eye, Edit, Trash2 } from "lucide-react";
import FlockDelete from "./FlockDelete/FlockDelete";
import Statistical from "./Statistical/Statistical";
import FilterFlock from "./FilterFlock/FilterFlock";
import FlockDetailModal from "./FlockDetail/FlockDetailModal";
import EditFlockModal from "./EditFlockModal/EditFlockModal";
import HeaderFlock from "./ButtonFlockAdd/HeaderFlock";
import { set } from "date-fns";

// Component FlockRow (Không thay đổi)
const FlockRow = ({
  flock,
  index,
  formatDate,
  getStatusBadge,
  onView,
  onEdit,
  onDelete,
  setSelectedFlockId,
  setFlocks, // Truyền hàm setFlocks để cập nhật danh sách
}) => {
  return (
    <tr key={flock._id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
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
      <td className="px-4 py-2 text-center">{getStatusBadge(flock.status)}</td>
      <td className="px-4 py-2 text-center flex justify-center gap-2">
        <button className="p-2 rounded cursor-pointer hover:bg-gray-200" title="Xem chi tiết" onClick={() => { onView(flock._id);       // Giữ nguyên hàm của leader
           setSelectedFlockId(flock._id);
       }}
        >
          <Eye size={16} className="w-4 h-4 text-gray-600" />
          </button>

        <button className="p-2 rounded cursor-pointer hover:bg-blue-200" title="Chỉnh sửa" onClick={() => onEdit(flock._id)}>
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

// Component Flocks (Đã cập nhật)
function Flocks() {
  const [flocks, setFlocks] = useState([]); // Danh sách master
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const rowsPerPage = 5;

  // State cho bộ lọc
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSpecies, setFilterSpecies] = useState("all");
  
  const [selectedFlockId, setSelectedFlockId] = useState(null);

  // === THÊM STATE CHO TÌM KIẾM ===
  const [searchTerm, setSearchTerm] = useState("");
  // ===============================

  // === STATE CHO EDIT MODAL ===
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFlock, setSelectedFlock] = useState(null);
  // ============================

  // Gọi API (Không thay đổi)
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

  // === CẬP NHẬT LOGIC LỌC ===
  const filteredFlocks = useMemo(() => {
    // Chuyển đổi searchTerm sang chữ thường một lần
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const handleAddFlock = (newFlock) => {
      setFlocks((prev) => [newFlock, ...prev]);  // đưa đàn mới lên đầu bảng
    };

    return flocks.filter(flock => {
      // Logic lọc trạng thái
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "Raising" && (flock.status === "Raising" || flock.status === "Đang nuôi")) ||
        (filterStatus === "Sold" && (flock.status === "Sold" || flock.status === "Đã bán")) ||
        flock.status === filterStatus;

      // Logic lọc giống gà
      const speciesMatch = filterSpecies === "all" || flock.speciesId === filterSpecies;
      
      // Logic tìm kiếm theo mã lứa (flock.code)
      const searchMatch = (flock.code || '') // Xử lý nếu code là null/undefined
        .toLowerCase()
        .includes(lowerCaseSearchTerm);

      return statusMatch && speciesMatch && searchMatch; // Thêm điều kiện searchMatch
    });
  }, [flocks, filterStatus, filterSpecies, searchTerm]); // Thêm searchTerm vào dependency
  
  // Lấy danh sách giống gà động (Không thay đổi)
  const allSpecies = useMemo(() => 
    [...new Set(flocks.map(flock => flock.speciesId).filter(Boolean))]
  , [flocks]);

  //Lấy dữ liệu để thêm đàn gà
  const addFlockData =  (data) => {
    console.log(data)
    const newFlockList = [...flocks];
    newFlockList.unshift(data);
    setFlocks(newFlockList);
  }
  
  // === CẬP NHẬT RESET TRANG ===
  useEffect(() => {
    setCurrentPage(1); // Quay về trang 1 mỗi khi bộ lọc HOẶC tìm kiếm thay đổi
  }, [filterStatus, filterSpecies, searchTerm]); // Thêm searchTerm vào dependency
  // ===========================

  // Format ngày (Không thay đổi)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Badge trạng thái (Không thay đổi)
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

  // Cập nhật phân trang (Không thay đổi, vì đã dùng filteredFlocks)
  const totalPages = Math.ceil(filteredFlocks.length / rowsPerPage) || 1;
  const currentFlocks = filteredFlocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Xử lý sự kiện (Không thay đổi)
  const handleView = (id) => console.log("👁️ Xem chi tiết đàn:", id);
  
  // Xử lý mở modal chỉnh sửa
  const handleEdit = (id) => {
    const flock = flocks.find((f) => f._id === id);
    if (flock) {
      setSelectedFlock(flock);
      setIsEditModalOpen(true);
    }
  };

  // Xử lý sau khi cập nhật thành công
  const handleUpdateSuccess = (updatedFlock) => {
    setFlocks((prev) =>
      prev.map((f) => (f._id === updatedFlock._id ? updatedFlock : f))
    );
    setIsEditModalOpen(false);
    setSelectedFlock(null);
  };

  // Đóng modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFlock(null);
  };

  const handleDelete = (id) => console.log("🗑️ Xóa đàn:", id);

  return (
    <div className="px-8 mt-8">
      <HeaderFlock addFlockData={addFlockData} />
      
      <Statistical flocks={filteredFlocks} />
      
      {/* === TRUYỀN PROPS TÌM KIẾM CHO FILTER === */}
      <FilterFlock 
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterSpecies={filterSpecies}
        onSpeciesChange={setFilterSpecies}
        allSpecies={allSpecies}
        searchTerm={searchTerm} // Truyền giá trị tìm kiếm
        onSearchChange={setSearchTerm} // Truyền hàm cập nhật
      />
      {/* ======================================= */}

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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-sm font-semibold">Mã lứa</th>
                  <th className="px-4 py-2 text-sm font-semibold">Ngày nhập</th>
                  <th className="px-4 py-2 text-sm font-semibold">Giống</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">SL ban đầu</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">SL hiện tại</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">TL TB (kg/con)</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">Trạng thái</th>
                  <th className="px-4 py-2 text-sm font-semibold text-center">Hành động</th>
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
                    setSelectedFlockId={setSelectedFlockId}
                    setFlocks={setFlocks}   // Truyền hàm setFlocks để cập nhật danh sách
                  />
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
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
                  Quay lại
                </button>
                <span>
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 border rounded disabled:opacity-50 ${
                    currentPage !== totalPages
                      ? "hover:bg-amber-200 transition cursor-pointer"
                      : ""
                  }`}
                >
                  Trang tiếp
                </button>
              </div>
            )}
          </>
        )}
      </div>
    {selectedFlockId && (
      <FlockDetailModal
      flockId={selectedFlockId}
      onClose={() => setSelectedFlockId(null)}
      />
    )}

      {/* Edit Flock Modal */}
      <EditFlockModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        flockData={selectedFlock}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
}

export default Flocks;