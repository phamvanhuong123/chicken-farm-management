// src/pages/FlockTransactions/FlockTransactions.jsx
import { useEffect, useState } from "react";
import { useImport } from "./hooks/useImport";
import { transactionAPI } from "../../apis/transaction.api";
import ImportTabs from "../../components/FlockTransactions/ImportTabs";
import ImportList from "../../components/FlockTransactions/ImportList";
import ImportForm from "../../components/FlockTransactions/ImportForm";
import ExportFlockModal from "../../components/FlockTransactions/ExportFlockModal";
import DashboardKPI from "../../components/FlockTransactions/DashboardKPI";
import MonthYearFilter from "../../components/FlockTransactions/MonthYearFilter";
import Pagination from "../../components/FlockTransactions/Pagination";
import { flockApi } from "../../apis/flockApi";

function FlockTransactions() {
  const { imports, loadData, createImport, areaCurrentCounts } = useImport();
  const [showImportForm, setShowImportForm] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [tab, setTab] = useState("nhap");
  const [loading, setLoading] = useState(false);
  const [exports, setExports] = useState([]);
  
  // State cho lọc tháng
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // State cho phân trang
  const [pagination, setPagination] = useState({
    importPage: 1,
    exportPage: 1,
    rowsPerPage: 10,
    totalImportRows: 0,
    totalExportRows: 0
  });

  // State cho flocks (đàn gà)
  const [flocks, setFlocks] = useState([]);
  
  // State cho imports và exports đã lọc
  const [filteredImports, setFilteredImports] = useState([]);
  const [filteredExports, setFilteredExports] = useState([]);

  // State cho dữ liệu hiển thị sau khi phân trang
  const [pagedImports, setPagedImports] = useState([]);
  const [pagedExports, setPagedExports] = useState([]);

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Filter dữ liệu khi selectedMonth thay đổi
  useEffect(() => {
    if (imports.length > 0 || exports.length > 0 || flocks.length > 0) {
      filterDataByMonth();
    }
  }, [selectedMonth, imports, exports, flocks]);

  // Cập nhật dữ liệu phân trang khi filtered data thay đổi
  useEffect(() => {
    updatePagedData();
  }, [filteredImports, filteredExports, pagination]);

  // Hàm lọc flocks đang nuôi
  const getActiveFlocks = () => {
    return flocks.filter(f => 
      f.status === "Raising" || f.status === "Đang nuôi"
    );
  };

  // Hàm load flocks từ API
  const loadFlocks = async () => {
    try {
      const response = await flockApi.getList();
      const flockData = Array.isArray(response.data?.data) 
        ? response.data.data 
        : [];
      
      const filteredFlocks = flockData.filter(f => 
        f.status === "Raising" || f.status === "Đang nuôi"
      );
      
      setFlocks(filteredFlocks);
    } catch (error) {
      console.error("Error loading flocks:", error);
      setFlocks([]);
    }
  };

  const updatePagedData = () => {
    const { importPage, exportPage, rowsPerPage } = pagination;
    
    // Tính toán dữ liệu phân trang cho imports
    const importStartIndex = (importPage - 1) * rowsPerPage;
    const importEndIndex = importStartIndex + rowsPerPage;
    const currentImports = filteredImports.slice(importStartIndex, importEndIndex);
    setPagedImports(currentImports);
    
    // Tính toán dữ liệu phân trang cho exports
    const exportStartIndex = (exportPage - 1) * rowsPerPage;
    const exportEndIndex = exportStartIndex + rowsPerPage;
    const currentExports = filteredExports.slice(exportStartIndex, exportEndIndex);
    setPagedExports(currentExports);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await loadData();
      await loadExports();
      await loadFlocks();
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lọc dữ liệu theo tháng
  const filterDataByMonth = () => {
    const [year, month] = selectedMonth.split('-');
    
    // Lọc imports
    const filteredImportData = imports.filter(imp => {
      if (!imp.importDate) return false;
      const importDate = new Date(imp.importDate);
      return importDate.getFullYear() === parseInt(year) && 
             importDate.getMonth() + 1 === parseInt(month);
    });
    setFilteredImports(filteredImportData);

    // Lọc exports
    const filteredExportData = exports.filter(exp => {
      const transactionDate = exp.transactionDate || exp.exportDate;
      if (!transactionDate) return false;
      const date = new Date(transactionDate);
      return date.getFullYear() === parseInt(year) && 
             date.getMonth() + 1 === parseInt(month);
    });
    setFilteredExports(filteredExportData);
    
    // Cập nhật tổng số hàng
    setPagination(prev => ({
      ...prev,
      totalImportRows: filteredImportData.length,
      totalExportRows: filteredExportData.length,
      importPage: 1,
      exportPage: 1
    }));
  };

  // Tải danh sách xuất chuồng
  const loadExports = async () => {
    try {
      const response = await transactionAPI.getAll();
      const exportData = response.data?.data?.items || response.data?.items || [];
      setExports(exportData);
    } catch (error) {
      console.error("Error loading exports:", error);
      setExports([]);
    }
  };

  // Xử lý tạo nhập chuồng
  const handleCreateImport = async (data) => {
    setLoading(true);
    try {
      await createImport(data);
      alert("Thêm lứa nhập chuồng thành công.");
      setShowImportForm(false);
      await loadAllData();
    } catch (error) {
      alert("Không thể lưu, vui lòng thử lại sau.");
      console.error("Error creating import:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi export thành công
  const handleExportSuccess = async (newExport) => {
    try {
      setExports(prev => [newExport, ...prev]);
      await loadExports();
      await loadFlocks();
    } catch (error) {
      console.error("Error handling export success:", error);
    }
  };

  // Xử lý phân trang cho imports
  const handleImportPageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      importPage: page
    }));
  };

  // Xử lý phân trang cho exports
  const handleExportPageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      exportPage: page
    }));
  };

  // Thay đổi số dòng trên trang
  const handleRowsPerPageChange = (rows) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: rows,
      importPage: 1,
      exportPage: 1
    }));
  };

  return (
    <div className="px-8 mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Nhập / Xuất chuồng</h1>
        
        {/* Bộ lọc chung cho toàn trang */}
        <MonthYearFilter 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          loading={loading}
        />
      </div>
      
      {/* DASHBOARD KPI */}
      <DashboardKPI selectedMonth={selectedMonth} />
      
      {/* TAB */}
      <ImportTabs tab={tab} setTab={setTab} />

      {/* TAB: XUẤT CHUỒNG */}
      {tab === "xuat" && (
        <>
          {/* BUTTON và thông tin */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Danh sách xuất chuồng</h2>
              <p className="text-sm text-gray-500">
                Quản lý các đơn xuất gia súc - Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
              </p>
              {/* Thêm thông tin số đàn đang nuôi */}
              <p className="text-sm text-blue-600 mt-1">
                Có {getActiveFlocks().length} đàn gà đang nuôi có thể xuất
              </p>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-fit"
              onClick={() => setShowExportForm(true)}
              disabled={loading || getActiveFlocks().length === 0}
            >
              <span>+</span>
              <span>Xuất chuồng mới</span>
            </button>
          </div>

          {getActiveFlocks().length === 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">
                Chưa có đàn gà nào để xuất chuồng. Vui lòng nhập chuồng trước.
              </p>
            </div>
          )}

          {/* DANH SÁCH XUẤT CHUỒNG */}
          <div className="w-full mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                  <th className="py-4 px-4 font-medium">Mã đơn</th>
                  <th className="py-4 px-4 font-medium">Ngày xuất</th>
                  <th className="py-4 px-4 font-medium">Khách hàng</th>
                  <th className="py-4 px-4 font-medium">Đàn xuất</th>
                  <th className="py-4 px-4 font-medium text-right">Số lượng</th>
                  <th className="py-4 px-4 font-medium text-right">Trọng lượng TB</th>
                  <th className="py-4 px-4 font-medium text-right">Giá/kg</th>
                  <th className="py-4 px-4 font-medium text-right">Doanh thu</th>
                  <th className="py-4 px-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedExports.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 px-4 text-center text-gray-500">
                      {loading ? "Đang tải dữ liệu..." : "Không có dữ liệu xuất chuồng trong tháng này"}
                    </td>
                  </tr>
                ) : (
                  pagedExports.map((item) => (
                    <ExportItem key={item._id} item={item} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG CHO XUẤT CHUỒNG */}
          {filteredExports.length > 0 && (
            <Pagination
              currentPage={pagination.exportPage}
              totalRows={pagination.totalExportRows}
              rowsPerPage={pagination.rowsPerPage}
              onPageChange={handleExportPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              className="mt-4"
            />
          )}

          {/* MODAL XUẤT CHUỒNG */}
          <ExportFlockModal
            isOpen={showExportForm}
            onClose={() => setShowExportForm(false)}
            flocks={getActiveFlocks()}
            onExportSuccess={handleExportSuccess}
          />
        </>
      )}

      {/* TAB: NHẬP CHUỒNG */}
      {tab === "nhap" && (
        <>
          {/* BUTTON và thông tin */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Danh sách nhập chuồng</h2>
              <p className="text-sm text-gray-500">
                Quản lý các lứa gia súc nhập chuồng - Tháng {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
              </p>
            </div>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed w-fit"
              onClick={() => setShowImportForm(true)}
              disabled={loading}
            >
              <span>+</span>
              <span>Nhập chuồng mới</span>
            </button>
          </div>

          {/* DANH SÁCH NHẬP CHUỒNG */}
          <ImportList list={pagedImports} />

          {/* PHÂN TRANG CHO NHẬP CHUỒNG */}
          {filteredImports.length > 0 && (
            <Pagination
              currentPage={pagination.importPage}
              totalRows={pagination.totalImportRows}
              rowsPerPage={pagination.rowsPerPage}
              onPageChange={handleImportPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              className="mt-4"
            />
          )}

          {/* FORM NHẬP CHUỒNG */}
          {showImportForm && (
            <ImportForm
              onClose={() => setShowImportForm(false)}
              onSubmit={handleCreateImport}
              areaCurrentCounts={areaCurrentCounts}
            />
          )}
        </>
      )}
    </div>
  );
}

// Component cho item xuất chuồng
function ExportItem({ item }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Tính doanh thu nếu không có trong item
  const calculateRevenue = (item) => {
    if (item.totalRevenue) return item.totalRevenue;
    return (item.quantity * item.avgWeight * item.pricePerKg) || 0;
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 font-medium text-gray-900">
        {item._id?.slice(-6).toUpperCase() || 'N/A'}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {formatDate(item.exportDate || item.transactionDate)}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.customerName || item.customer || 'N/A'}
      </td>
      <td className="py-4 px-4 text-gray-700">
        {item.flockCode || item.flockId?.slice(-6).toUpperCase() || 'N/A'}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {(item.quantity || 0).toLocaleString('vi-VN')}
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {item.avgWeight || 0} kg
      </td>
      <td className="py-4 px-4 text-right text-gray-700">
        {formatCurrency(item.pricePerKg || 0)}
      </td>
      <td className="py-4 px-4 text-right text-green-600 font-semibold">
        {formatCurrency(calculateRevenue(item))}
      </td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          item.status === "completed" || item.status === "Hoàn thành"
            ? "bg-green-100 text-green-800" 
            : item.status === "pending" || item.status === "Đang xử lý"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-gray-100 text-gray-800"
        }`}>
          {item.status === "completed" ? "Hoàn thành" : 
           item.status === "pending" ? "Đang xử lý" : 
           item.status === "Đang xử lý" ? "Đang xử lý" :
           item.status === "Hoàn thành" ? "Hoàn thành" : "Đã hủy"}
        </span>
      </td>
    </tr>
  );
}

export default FlockTransactions;Ư