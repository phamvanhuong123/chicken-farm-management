import ImportItem from "./ImportItem";

export default function ImportList({ list }) {
  if (!list || list.length === 0) {
    return (
      <div className="w-full mt-6 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-500">Chưa có dữ liệu nhập chuồng</p>
      </div>
    );
  }

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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {list.map((item) => (
            <ImportItem key={item._id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}