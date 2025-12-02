export default function ImportItem({ item }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('vi-VN').format(number);
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 font-medium text-gray-900">
        {item._id?.slice(-6).toUpperCase()}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {formatDate(item.importDate)}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.supplier}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.breed}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {formatNumber(item.quantity)}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {item.avgWeight} kg
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.barn}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.status === "Đang nuôi" 
            ? "bg-blue-100 text-blue-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {item.status}
        </span>
      </td>
    </tr>
  );
}
