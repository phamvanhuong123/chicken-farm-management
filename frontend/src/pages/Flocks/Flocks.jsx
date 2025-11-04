import React, { useState } from "react";
import ActionButtons from "../../components/Flock/ActionButtons";

export default function Flocks() {
  const [flocks, setFlocks] = useState([
    {
      id: "A001",
      date: "2024-01-15",
      breed: "Gà Ri",
      initial: 1500,
      current: 1485,
      avgWeight: "1.8kg",
      status: "Đang nuôi",
    },
    {
      id: "B002",
      date: "2024-01-20",
      breed: "Gà Tam Hoàng",
      initial: 2000,
      current: 1950,
      avgWeight: "2.1kg",
      status: "Đang nuôi",
    },
    {
      id: "C003",
      date: "2024-02-01",
      breed: "Gà Ai Cập",
      initial: 1200,
      current: 0,
      avgWeight: "2.5kg",
      status: "Đã bán",
    },
  ]);

  const [filter, setFilter] = useState({
    status: "Tất cả",
    breed: "Tất cả",
    search: "",
  });

  const [editing, setEditing] = useState(null);

  const filtered = flocks.filter((f) => {
    return (
      (filter.status === "Tất cả" || f.status === filter.status) &&
      (filter.breed === "Tất cả" || f.breed === filter.breed) &&
      (filter.search === "" ||
        f.id.toLowerCase().includes(filter.search.toLowerCase()))
    );
  });

  // Hàm mở form chỉnh sửa
  const handleEdit = (flock) => {
    setEditing({ ...flock });
  };

  // Hàm xem chi tiết
  const handleView = (flock) => {
    alert(
      `Chi tiết đàn:\n\n` +
        `Mã lứa: ${flock.id}\n` +
        `Giống: ${flock.breed}\n` +
        `Ngày nhập: ${flock.date}\n` +
        `Số lượng ban đầu: ${flock.initial}\n` +
        `Số lượng hiện tại: ${flock.current}\n` +
        `Trọng lượng TB: ${flock.avgWeight}\n` +
        `Trạng thái: ${flock.status}`
    );
  };

  // Hàm xóa đàn
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đàn này không?")) {
      setFlocks((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // Hàm lưu sau khi chỉnh sửa + validate dữ liệu
  const handleSave = () => {
    if (!editing.date) {
      alert("Vui lòng chọn ngày nhập!");
      return;
    }

    const ngayNhap = new Date(editing.date);
    const today = new Date();
    if (ngayNhap > today) {
      alert("Ngày nhập không được vượt quá ngày hiện tại!");
      return;
    }

    if (editing.initial <= 0) {
      alert("Số lượng ban đầu phải lớn hơn 0!");
      return;
    }

    if (editing.current < 0 || editing.current > editing.initial) {
      alert("Số lượng hiện tại không hợp lệ!");
      return;
    }

    if (!editing.avgWeight || !/^\d+(\.\d+)?kg$/.test(editing.avgWeight)) {
      alert("Trọng lượng trung bình phải có định dạng số + 'kg' (VD: 2.1kg)");
      return;
    }

    // Cập nhật vào danh sách
    setFlocks((prev) =>
      prev.map((f) => (f.id === editing.id ? editing : f))
    );

    alert("Cập nhật thông tin đàn thành công!");
    setEditing(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* --- Thống kê --- */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tổng số đàn</p>
          <h2 className="text-2xl font-bold text-green-700">{flocks.length}</h2>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Đàn đang nuôi</p>
          <h2 className="text-2xl font-bold text-blue-700">
            {flocks.filter((f) => f.status === "Đang nuôi").length}
          </h2>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Trọng lượng TB</p>
          <h2 className="text-2xl font-bold text-purple-700">1.9kg</h2>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Tỷ lệ chết TB</p>
          <h2 className="text-2xl font-bold text-orange-700">2.1%</h2>
        </div>
      </div>

      {/* --- Bộ lọc --- */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm">
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option>Tất cả</option>
          <option>Đang nuôi</option>
          <option>Đã bán</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filter.breed}
          onChange={(e) => setFilter({ ...filter, breed: e.target.value })}
        >
          <option>Tất cả</option>
          <option>Gà Tam Hoàng</option>
          <option>Gà Broiler</option>
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm mã lứa..."
          className="border rounded-lg px-3 py-2 flex-1 text-sm"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
          🔍
        </button>
      </div>

      {/* --- Bảng danh sách --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="border-b">
            <tr className="text-gray-600">
              <th className="p-3">Mã lứa</th>
              <th className="p-3">Ngày nhập</th>
              <th className="p-3">Giống</th>
              <th className="p-3">SL ban đầu</th>
              <th className="p-3">SL hiện tại</th>
              <th className="p-3">Trọng lượng TB</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{f.id}</td>
                <td className="p-3">{f.date}</td>
                <td className="p-3">{f.breed}</td>
                <td className="p-3">{f.initial.toLocaleString()}</td>
                <td className="p-3 font-semibold">{f.current.toLocaleString()}</td>
                <td className="p-3">{f.avgWeight}</td>
                <td className="p-3">
                  {f.status === "Đang nuôi" ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      Đang nuôi
                    </span>
                  ) : (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                      Đã bán
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <ActionButtons
                    onView={() => handleView(f)}
                    onEdit={() => handleEdit(f)}
                    onDelete={() => handleDelete(f.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-sm text-gray-500 mt-2">
          Hiển thị {filtered.length} trong tổng số {flocks.length} đàn
        </p>
      </div>

      {/* --- Modal chỉnh sửa --- */}
      {editing && (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50'>
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[400px] space-y-4 animate-fadeIn">
            <h3 className="text-lg font-semibold text-center">
              Chỉnh sửa thông tin đàn
            </h3>

            <div className="space-y-2">
              <label className="block text-sm">Ngày nhập:</label>
              <input
                type="date"
                className="border px-3 py-2 w-full rounded-lg text-sm"
                value={editing.date}
                onChange={(e) =>
                  setEditing({ ...editing, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Giống gà:</label>
              <select
                className="border px-3 py-2 w-full rounded-lg text-sm"
                value={editing.breed || ""}   // nếu editing.breed rỗng thì gán ""
                onChange={(e) => setEditing({ ...editing, breed: e.target.value })}
              >
                <option value="" disabled>
                  -- Chọn giống gà --
                </option>
                <option value="Gà Ri">Gà Ri</option>
                <option value="Gà Tam Hoàng">Gà Tam Hoàng</option>
                <option value="Gà Ai Cập">Gà Ai Cập</option>
              </select>

            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm">SL ban đầu:</label>
                <input
                  type="number"
                  className="border px-3 py-2 w-full rounded-lg text-sm"
                  value={editing.initial}
                  onChange={(e) =>
                    setEditing({ ...editing, initial: +e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm">SL hiện tại:</label>
                <input
                  type="number"
                  className="border px-3 py-2 w-full rounded-lg text-sm"
                  value={editing.current}
                  onChange={(e) =>
                    setEditing({ ...editing, current: +e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Trọng lượng TB:</label>
              <input
                type="text"
                className="border px-3 py-2 w-full rounded-lg text-sm"
                value={editing.avgWeight}
                onChange={(e) =>
                  setEditing({ ...editing, avgWeight: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Trạng thái:</label>
              <select
                className="border px-3 py-2 w-full rounded-lg text-sm"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                <option>Đang nuôi</option>
                <option>Đã bán</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
