import React, { useState } from "react";
import axios from "axios";
import { Trash2, X } from "lucide-react";
import swal from "sweetalert";

const API_BASE = "http://localhost:8071/v1";

/** Modal xác nhận xóa */
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl p-5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-full bg-amber-100 p-2">⚠️</div>

          <div className="grow">
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-slate-600">{message}</p>
          </div>

          <button onClick={onCancel} className="p-1 rounded hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded-lg border hover:bg-slate-50"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

/** ⭐ Xóa KHU NUÔI (TEAM-136) */
export default function DeleteArea({ area, onDeleted, onError }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickDelete = () => setModalOpen(true);

  /** Thực hiện xoá */
  const confirmDelete = async () => {
    try {
      setLoading(true);

      const res = await axios.delete(`${API_BASE}/areas/${area._id}`);

      if (res.data.status === "error") {
        swal(res.data.message, "", "warning");
        setModalOpen(false);
        return;
      }

      swal("Xóa khu nuôi thành công!", "", "success");

      if (onDeleted) onDeleted(area._id);

      // làm mới KPI
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kpi:refresh"));
      }
    } catch (err) {
      swal("Không thể xóa khu nuôi, vui lòng thử lại.", "", "error");
      if (onError) onError(err);
    } finally {
      setLoading(false);
      setModalOpen(false);
    }
  };

  return (
    <>
      <button
        title="Xóa"
        disabled={loading}
        onClick={handleClickDelete}
        className="p-2 rounded hover:bg-red-50 text-red-600 disabled:opacity-50 cursor-pointer"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        open={modalOpen}
        title="Bạn có chắc muốn xóa khu nuôi này?"
        message={`Xóa khu "${area.name}" sẽ không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
