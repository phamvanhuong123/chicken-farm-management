import React, { useState } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";

function Flocks() {
  const [flocks] = useState([
    {
      id: 1,
      code: "DG001",
      importDate: "2024-10-15",
      breed: "Gà Ri",
      initialQuantity: 1000,
      currentQuantity: 950,
      avgWeight: 2.5,
      status: "Đang nuôi",
    },
    {
      id: 2,
      code: "DG002",
      importDate: "2024-09-20",
      breed: "Gà Lương Phượng",
      initialQuantity: 800,
      currentQuantity: 780,
      avgWeight: 2.8,
      status: "Đang nuôi",
    },
    {
      id: 3,
      code: "DG003",
      importDate: "2024-08-10",
      breed: "Gà Đông Tảo",
      initialQuantity: 500,
      currentQuantity: 0,
      avgWeight: 3.2,
      status: "Đã bán",
    },
    {
      id: 4,
      code: "DG004",
      importDate: "2024-07-05",
      breed: "Gà Tre",
      initialQuantity: 1200,
      currentQuantity: 0,
      avgWeight: 2.3,
      status: "Đã bán",
    },
    {
      id: 5,
      code: "DG005",
      importDate: "2024-06-15",
      breed: "Gà Mía",
      initialQuantity: 600,
      currentQuantity: 600,
      avgWeight: 2.7,
      status: "Đang nuôi",
    },
    {
      id: 6,
      code: "DG006",
      importDate: "2024-05-20",
      breed: "Gà Đông Tảo",
      initialQuantity: 400,
      currentQuantity: 0,
      avgWeight: 3.0,
      status: "Đã bán",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status) => (
    <span
      className={`px-2 py-1 text-xs font-medium rounded ${
        status === "Đang nuôi"
          ? "bg-green-100 text-green-800"
          : "bg-gray-200 text-gray-800"
      }`}
    >
      {status}
    </span>
  );

  const totalPages = Math.ceil(flocks.length / rowsPerPage);
  const currentFlocks = flocks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div className="px-8 mt-8">
      <h1 className="text-3xl font-bold mb-6">Quản lí đàn gà</h1>

      <div className="bg-white rounded shadow overflow-x-auto">
        {flocks.length === 0 ? (
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
                  <tr
                    key={flock.id}
                    className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2">{flock.code}</td>
                    <td className="px-4 py-2">
                      {formatDate(flock.importDate)}
                    </td>
                    <td className="px-4 py-2">{flock.breed}</td>
                    <td className="px-4 py-2 text-center">
                      {flock.initialQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {flock.currentQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {flock.avgWeight.toFixed(1)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {getStatusBadge(flock.status)}
                    </td>
                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                      <button title="Xem chi tiết">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button title="Chỉnh sửa">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button title="Xóa">
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center px-4 py-3 border-t text-sm text-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded disabled:opacity-50  ${
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
          </>
        )}
      </div>
    </div>
  );
}

export default Flocks;
