import React, { useState } from "react";
import { exportAreasExcel } from "../../../services/areaService";
import CreateAreaModal from "./CreateAreaModal";
import { useIsEmployer } from "~/hooks/useIsEmployer";

function HeaderArea({ refresh }) {
  const [openCreate, setOpenCreate] = useState(false);
  const isEmployer = useIsEmployer();
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Khu nuôi</h2>

        <div className="flex gap-3">
          <button
            onClick={exportAreasExcel}
            className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100"
          >
            Xuất Excel
          </button>
          {isEmployer && (
            <button
              onClick={() => setOpenCreate(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Thêm khu
            </button>
          )}
        </div>
      </div>

      <CreateAreaModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSuccess={refresh}
      />
    </>
  );
}

export default HeaderArea;
