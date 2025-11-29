import React from "react";
import { exportAreasExcel } from "../../../services/areaService";

function HeaderArea() {
  const handleExport = () => {
    exportAreasExcel();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Khu nuôi</h2>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100"
        >
          ⬇ Xuất Excel
        </button>

        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          + Thêm khu
        </button>
      </div>
    </div>
  );
}

export default HeaderArea;
