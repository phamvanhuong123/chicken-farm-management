import React from "react";

function FilterArea({ filters, setFilters }) {
  const update = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6 flex gap-4">
      <input
        type="text"
        placeholder="Tìm tên khu..."
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="flex-1 px-3 py-2 border rounded-md"
      />

      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="ACTIVE">Đang hoạt động</option>
        <option value="EMPTY">Đang trống</option>
        <option value="MAINTENANCE">Bảo trì</option>
        <option value="INCIDENT">Có sự cố</option>
      </select>

      <input
        type="text"
        placeholder="Tên nhân viên…"
        value={filters.staffName}
        onChange={(e) => update("staffName", e.target.value)}
        className="px-3 py-2 border rounded-md"
      />
    </div>
  );
}

export default FilterArea;
