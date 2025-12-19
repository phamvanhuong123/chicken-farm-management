import React, { useState } from "react";
import FinanceCreateForm from "../FinanceCreateForm/FinanceCreateForm";

function HeaderFinance({ refresh }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý giao dịch</h1>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setOpen(true)}
        >
          + Thêm giao dịch
        </button>
      </div>

      {open && (
        <FinanceCreateForm
          onClose={() => setOpen(false)}
          onSuccess={() => {
            refresh();
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

export default HeaderFinance;
