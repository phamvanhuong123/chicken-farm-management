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

/** Component xử lý xóa đàn (TEAM-89) */
export default function FlockDelete({ flock, onDeleted, onError }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRaising = (status) => {
    const s = (status || "").toString().trim().toLowerCase();
    return s.includes("đang nuôi") || s.includes("dang nuoi");
  };

  const handleClickDelete = () => setModalOpen(true);

  const confirmDelete = async () => {
    if (isRaising(flock.status)) {
      swal(
        "Không thể xóa đàn đang nuôi. Vui lòng hoàn tất xuất chuồng trước khi xóa."
      );
      setModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/flocks/${flock._id}`);
      swal("Xoá đàn thành công.", "", "success");

      if (onDeleted) onDeleted(flock._id);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kpi:refresh"));
      }
    } catch (err) {
      // swal("Không thể xóa đàn, vui lòng thử lại.",'');
      swal("Không thể xóa đàn, vui lòng thử lại.", "", "error");
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
        title="Bạn có chắc muốn xóa đàn này?"
        message={`Xóa đàn "${
          flock.name || flock.tenDan || flock._id
        }" sẽ không thể hoàn tác.`}
        onConfirm={confirmDelete}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
