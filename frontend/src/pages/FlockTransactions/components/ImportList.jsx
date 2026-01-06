import ImportItem from "../components/ImportItem";

export default function ImportList({ list, onEdit, onDelete }) {
  if (!list || list.length === 0) {
    return (
      <div className="w-full mt-6 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">Chưa có dữ liệu nhập chuồng</p>
      </div>
    );
  }

  const uniqueList = list.filter((item, index, self) =>
    index === self.findIndex((t) => t._id === item._id)
  );

  return (
    <div className="w-full mt-6 border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
            <th className="py-3 px-4 border-b">Mã đàn</th>
            <th className="py-3 px-4 border-b">Ngày nhập</th>
            <th className="py-3 px-4 border-b">Nhà cung cấp</th>
            <th className="py-3 px-4 border-b">Giống</th>
            <th className="py-3 px-4 border-b text-right">Số lượng</th>
            <th className="py-3 px-4 border-b text-right">Trọng lượng TB</th>
            <th className="py-3 px-4 border-b">Khu nuôi</th>
            <th className="py-3 px-4 border-b">Trạng thái</th>
            <th className="py-3 px-4 border-b text-center">Hành động</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {uniqueList.map((item) => (
            <ImportItem
              key={item._id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}