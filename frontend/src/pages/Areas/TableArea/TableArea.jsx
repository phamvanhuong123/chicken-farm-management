import React from "react";
import AreaRow from "./AreaRow";

function TableArea({ data, loading, pagination, setFilters, filters }) {
  const changePage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Tên khu</th>
            <th className="p-2 text-left">Sức chứa</th>
            <th className="p-2 text-left">Nhân viên</th>
            <th className="p-2 text-left">Trạng thái</th>
            <th className="p-2 text-left">Ghi chú</th>
            <th className="p-2 text-left">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="p-4 text-center">
                Đang tải dữ liệu...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                Không có dữ liệu phù hợp.
              </td>
            </tr>
          ) : (
            data.map((area) => <AreaRow key={area._id} item={area} />)
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button
          disabled={filters.page <= 1}
          onClick={() => changePage(filters.page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ◀
        </button>

        <span className="px-3 py-1">
          Trang {pagination.page} / {pagination.totalPages}
        </span>

        <button
          disabled={filters.page >= pagination.totalPages}
          onClick={() => changePage(filters.page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default TableArea;
