export default function ImportTabs({ tab, setTab }) {
  return (
    <div className="flex border-b border-gray-200">
      <button
        onClick={() => setTab("nhap")}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          tab === "nhap" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Nhập chuồng
      </button>

      <button
        onClick={() => setTab("xuat")}
        className={`px-6 py-3 font-medium text-sm transition-colors ${
          tab === "xuat" 
            ? "text-green-600 border-b-2 border-green-600" 
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Xuất chuồng
      </button>
    </div>
  );
}