import React, { useEffect, useState } from "react";

export default function FlockDetailModal({ flockId, onClose }) {
  const [flock, setFlock] = useState(null);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState("info");
  const [error, setError] = useState("");

  useEffect(() => {
    // Giả lập fetch API
    setTimeout(() => {
      if (flockId === "A001") {
        setFlock({
          code: "A001",
          species: "Gà Ri",
          importDate: "2024-01-15",
          initial: 1500,
          current: 1485,
          weight: 1.8,
          supplier: "Trại giống Minh Châu",
          area: "Khu A",
          cost: 50000000,
          note: "Đàn phát triển tốt",
          status: "Raising",
        });
        setLogs([
          {
            id: 1,
            date: "2024-02-01",
            type: "Cho ăn",
            quantity: "50kg",
            note: "Cho ăn buổi sáng",
            user: "Nguyễn Văn A",
          },
          {
            id: 2,
            date: "2024-02-05",
            type: "Tiêm thuốc",
            quantity: "2 lọ",
            note: "Vaccine cúm",
            user: "Lê Thị B",
          },
        ]);
      } else {
        setError("Không thể tải thông tin đàn, vui lòng thử lại.");
      }
    }, 400);
  }, [flockId]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[700px] rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          Chi tiết đàn {flock?.code || ""}
        </h2>

        {error ? (
          <p className="text-red-500 text-center py-4">{error}</p>
        ) : !flock ? (
          <p className="text-center text-gray-500 py-4">Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b mb-4">
              <button
                className={`pb-2 px-4 ${
                  tab === "info"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setTab("info")}
              >
                Thông tin đàn
              </button>
              <button
                className={`pb-2 px-4 ${
                  tab === "logs"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
                onClick={() => setTab("logs")}
              >
                Nhật ký liên quan
              </button>
            </div>

            {/* Nội dung tab */}
            {tab === "info" ? (
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <p><b>Mã lứa:</b> {flock.code}</p>
                <p><b>Giống gà:</b> {flock.species}</p>
                <p><b>Ngày nhập:</b> {flock.importDate}</p>
                <p><b>Số lượng:</b> {flock.initial} / {flock.current}</p>
                <p><b>Trọng lượng TB:</b> {flock.weight}kg</p>
                <p><b>Nhà cung cấp:</b> {flock.supplier}</p>
                <p><b>Khu nuôi:</b> {flock.area}</p>
                <p><b>Chi phí nhập:</b> {flock.cost.toLocaleString()} ₫</p>
                <p className="col-span-2"><b>Ghi chú:</b> {flock.note}</p>
                <p>
                  <b>Trạng thái:</b>{" "}
                  {flock.status === "Raising" ? "Đang nuôi" : "Đã bán"}
                </p>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Chưa có nhật ký nào cho đàn này.
              </p>
            ) : (
              <table className="w-full text-sm border mt-2">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Ngày</th>
                    <th className="p-2 border">Loại nhật ký</th>
                    <th className="p-2 border">Số lượng</th>
                    <th className="p-2 border">Ghi chú</th>
                    <th className="p-2 border">Người ghi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td className="p-2 border">{l.date}</td>
                      <td className="p-2 border">{l.type}</td>
                      <td className="p-2 border">{l.quantity}</td>
                      <td className="p-2 border">{l.note}</td>
                      <td className="p-2 border">{l.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="text-right mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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