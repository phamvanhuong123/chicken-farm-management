import React, { useEffect, useState } from "react";
import { formatDate } from "~/utils/formatter";

export default function FlockDetailModal({ flockId, onClose }) {
  const [flock, setFlock] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const res = await fetch(`http://localhost:8071/v1/flocks/${flockId}`);
        const json = await res.json();

        if (!json?.data) throw new Error();

        setFlock(json.data.flock);
        setLogs(json.data.logs || []);
      } catch (err) {
        setError("Không thể tải thông tin đàn, vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [flockId]);

  return (
    <div className='fixed inset-0 bg-black/30 backdrop-blur-[2px] flex justify-center items-center z-50 transition-all duration-300'>
        <div className='bg-white rounded-2xl shadow-lg p-8 w-[650px] relative animate-fadeIn'>

        {/* Nút đóng */}
        <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-600 hover:text-black text-lg cursor-pointer"
        >
        ✕
        </button>


        {loading ? (
          <p className="text-center py-10">Đang tải...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : (
          <>
            {/* Tiêu đề */}
            <h2 className="text-2xl font-bold mb-4">Chi tiết đàn</h2>

            {/* Thông tin đàn */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Info label="Mã lứa" value={flock.code} />
              <Info label="Giống gà" value={flock.speciesId} />
              <Info label="Ngày nhập" value={formatDate(flock.createdAt)} />
              <Info label="Số lượng ban đầu" value={flock.initialCount} />
              <Info label="Số lượng hiện tại" value={flock.currentCount} />
              <Info label="Trọng lượng TB" value={`${flock.avgWeight} kg`} />
              <Info label="Nhà cung cấp" value={flock.supplier || "-"} />
              <Info label="Khu nuôi" value={flock.areaId || "-"} />
              <Info label="Chi phí nhập" value={flock.importCost || "-"} />
              <Info
                label="Trạng thái"
                value={
                  flock.status === "Raising"
                    ? "Đang nuôi"
                    : flock.status === "Sold"
                    ? "Đã bán"
                    : flock.status
                }
              />
            </div>

            {/* Nhật ký */}
            <h3 className="text-xl font-semibold mb-2">Nhật ký liên quan</h3>

            {logs.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có nhật ký liên quan.</p>
            ) : (
              <table className="w-full border border-gray-200 mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 border">Ngày</th>
                    <th className="px-2 py-1 border">Loại</th>
                    <th className="px-2 py-1 border">Số lượng</th>
                    <th className="px-2 py-1 border">Ghi chú</th>
                    <th className="px-2 py-1 border">Người ghi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border">
                      <td className="px-2 py-1 border">{log.date}</td>
                      <td className="px-2 py-1 border">{log.type}</td>
                      <td className="px-2 py-1 border">{log.quantity}</td>
                      <td className="px-2 py-1 border">{log.note}</td>
                      <td className="px-2 py-1 border">
                        {log.userId?.name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Nút đóng */}
            <div className="mt-6 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer"
              >
              Đóng
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-600 font-medium">{label}:</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
