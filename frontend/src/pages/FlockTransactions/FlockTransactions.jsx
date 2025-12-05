import { useEffect, useState, useCallback } from "react";
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
import swal from "sweetalert";

// Chuẩn hóa parse Date an toàn
const parseDate = (value) => {
  try {
    if (!value) return null;
    if (typeof value === "string") return new Date(value);
    if (typeof value === "object" && value.$date) return new Date(value.$date);
    if (value instanceof Date) return value;
    return null;
  } catch {
    return null;
  }
};

function FlockTransactions() {
  const {
    imports,
    loadData,
    createImport,
    updateImport,
    deleteImport,
    areaCurrentCounts,
  } = useImport();

  const [exports, setExports] = useState([]);
  const [flocks, setFlocks] = useState([]);

  const [tab, setTab] = useState("nhap");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const [pagedImports, setPagedImports] = useState([]);
  const [pagedExports, setPagedExports] = useState([]);

  const [filteredImports, setFilteredImports] = useState([]);
  const [filteredExports, setFilteredExports] = useState([]);

  const [pagination, setPagination] = useState({
    importPage: 1,
    exportPage: 1,
    rowsPerPage: 10,
    totalImportRows: 0,
    totalExportRows: 0,
  });

  const [showImportForm, setShowImportForm] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [editImportData, setEditImportData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load toàn bộ dữ liệu (imports + flocks + exports)
  const loadAllData = async () => {
    try {
      setRefreshing(true);
      await loadData();
      await loadExports();
      await loadFlocks();
    } catch (error) {
      console.error("Lỗi load dữ liệu:", error);
      swal("Lỗi", "Không thể tải dữ liệu.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Load danh sách xuất chuồng
  const loadExports = async () => {
    try {
      const res = await transactionAPI.getAll();
      const list = res.data?.data?.items || res.data?.items || [];
      setExports(list);
    } catch (error) {
      console.error("Lỗi load exports:", error);
      setExports([]);
    }
  };

  const loadFlocks = async () => {
    try {
      const res = await flockApi.getList();
      const list =
        res.data?.data?.items ||
        res.data?.data ||
        res.data?.items ||
        [];

      const active = list.filter(
        (f) => f.status === "Raising" || f.status === "Đang nuôi"
      );

      setFlocks(active);
    } catch (error) {
      console.error("Lỗi load flocks:", error);
      setFlocks([]);
    }
  };

  // Bộ lọc dữ liệu theo tháng (imports + exports)
  const filterDataByMonth = useCallback(() => {
    const [year, month] = selectedMonth.split("-");
    const yearNum = Number(year);
    const monthNum = Number(month);

    // Lọc imports
    const filteredImp = imports.filter((imp) => {
      const d = parseDate(imp.importDate);
      if (!d) return false;
      return (
        d.getUTCFullYear() === yearNum &&
        d.getUTCMonth() + 1 === monthNum
      );
    });

    setFilteredImports(filteredImp);

    // Lọc exports
    const filteredExp = exports.filter((e) => {
      const d = parseDate(e.exportDate || e.transactionDate);
      if (!d) return false;
      return (
        d.getUTCFullYear() === yearNum &&
        d.getUTCMonth() + 1 === monthNum
      );
    });

    setFilteredExports(filteredExp);

    // Cập nhật số dòng
    setPagination((p) => ({
      ...p,
      totalImportRows: filteredImp.length,
      totalExportRows: filteredExp.length,
      importPage: 1,
      exportPage: 1,
    }));
  }, [imports, exports, selectedMonth]);

  useEffect(() => {
    filterDataByMonth();
  }, [filterDataByMonth]);

  // Phân trang
  useEffect(() => {
    const { importPage, exportPage, rowsPerPage } = pagination;

    const impStart = (importPage - 1) * rowsPerPage;
    const impEnd = impStart + rowsPerPage;
    setPagedImports(filteredImports.slice(impStart, impEnd));

    const expStart = (exportPage - 1) * rowsPerPage;
    const expEnd = expStart + rowsPerPage;
    setPagedExports(filteredExports.slice(expStart, expEnd));
  }, [pagination, filteredImports, filteredExports]);

  // HANDLERS
  const handleTabChange = (t) => {
    setTab(t);
  };

  const handleImportPageChange = (page) => {
    setPagination((p) => ({ ...p, importPage: page }));
  };

  const handleExportPageChange = (page) => {
    setPagination((p) => ({ ...p, exportPage: page }));
  };

  const handleRowsPerPageChange = (rows) => {
    setPagination((p) => ({
      ...p,
      rowsPerPage: rows,
      importPage: 1,
      exportPage: 1,
    }));
  };

  const handleCreateImport = async (data) => {
    try {
      await createImport(data);
      swal("Thành công", "Nhập chuồng thành công!", "success");
      setShowImportForm(false);
      await loadAllData();
    } catch (error) {
      console.error("Lỗi tạo import:", error);
      swal("Lỗi", "Không thể tạo đơn nhập!", "error");
    }
  };

  // Hàm cập nhật import
  const handleUpdateImport = async (id, data) => {
    try {
      const success = await updateImport(id, data);
      
      if (success) {
        await loadAllData();
        swal("Thành công", "Cập nhật đơn nhập thành công!", "success");
        setShowImportForm(false);
        setEditImportData(null);
      }
      return success;
    } catch (error) {
      console.error("Lỗi cập nhật import:", error);
      swal("Lỗi", "Không thể cập nhật đơn nhập!", "error");
      return false;
    }
  };

  // Hàm xóa import
  const handleDeleteImport = async (id) => {
    try {
      const success = await deleteImport(id);
      
      if (success) {
        await loadAllData();
        swal("Thành công", "Xóa đơn nhập thành công!", "success");
      }
      return success;
    } catch (error) {
      console.error("Lỗi xóa import:", error);
      swal("Lỗi", "Không thể xóa đơn nhập!", "error");
      return false;
    }
  };

  const handleExportSuccess = async () => {
    await loadExports();
    await loadFlocks();
  };

  return (
    <div className="px-8 mt-8">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-2xl font-bold">Nhập / Xuất chuồng</h1>

        <MonthYearFilter
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <DashboardKPI selectedMonth={selectedMonth} />

      <ImportTabs tab={tab} setTab={handleTabChange} />

      {/* TAB XUẤT */}
      {tab === "xuat" && (
        <>
          <div className="flex justify-between mt-6">
            <h2 className="text-lg font-semibold">Danh sách xuất chuồng</h2>

            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowExportForm(true)}
              disabled={refreshing}
            >
              {refreshing ? "Đang tải..." : "+ Xuất chuồng mới"}
            </button>
          </div>

          {/* Danh sách */}
          <div className="mt-4">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100 text-left text-sm font-semibold">
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Ngày xuất</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Đàn xuất</th>
                  <th className="p-3 text-right">Số lượng</th>
                  <th className="p-3 text-right">Trọng lượng TB</th>
                  <th className="p-3 text-right">Giá/kg</th>
                  <th className="p-3 text-right">Doanh thu</th>
                </tr>
              </thead>

              <tbody>
                {pagedExports.length === 0 ? (
                  <tr>
                    <td className="text-center p-4" colSpan={8}>
                      {refreshing ? "Đang tải dữ liệu..." : "Không có dữ liệu"}
                    </td>
                  </tr>
                ) : (
                  pagedExports.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="p-3">{item._id?.slice(0, 8)}</td>
                      <td className="p-3">
                        {parseDate(item.exportDate)?.toLocaleDateString("vi-VN")}
                      </td>
                      <td className="p-3">{item.customerName}</td>
                      <td className="p-3">{item.flockId?.slice(0, 8)}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{item.avgWeight} kg</td>
                      <td className="p-3 text-right">
                        {item.pricePerKg?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="p-3 text-right text-green-600">
                        {(
                          item.quantity *
                          item.avgWeight *
                          item.pricePerKg
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <Pagination
              currentPage={pagination.exportPage}
              totalRows={pagination.totalExportRows}
              rowsPerPage={pagination.rowsPerPage}
              onPageChange={handleExportPageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </div>

          <ExportFlockModal
            isOpen={showExportForm}
            onClose={() => setShowExportForm(false)}
            flocks={flocks}
            onExportSuccess={handleExportSuccess}
          />
        </>
      )}

      {/* TAB NHẬP */}
      {tab === "nhap" && (
        <>
          <div className="flex justify-between mt-6">
            <h2 className="text-lg font-semibold">Danh sách nhập chuồng</h2>

            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setEditImportData(null);
                setShowImportForm(true);
              }}
              disabled={refreshing}
            >
              {refreshing ? "Đang tải..." : "+ Nhập chuồng mới"}
            </button>
          </div>

          <ImportList 
            list={pagedImports}
            onEdit={(item) => {
              setEditImportData(item);
              setShowImportForm(true);
            }}
            onDelete={handleDeleteImport}
          />

          <Pagination
            currentPage={pagination.importPage}
            totalRows={pagination.totalImportRows}
            rowsPerPage={pagination.rowsPerPage}
            onPageChange={handleImportPageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />

          {showImportForm && (
            <ImportForm
              onClose={() => {
                setShowImportForm(false);
                setEditImportData(null);
              }}
              onSubmit={(data) => {
                if (editImportData?._id) {
                  handleUpdateImport(editImportData._id, data);
                } else {
                  handleCreateImport(data);
                }
              }}
              editData={editImportData}
              areaCurrentCounts={areaCurrentCounts}
            />
          )}
        </>
      )}
    </div>
  );
}

export default FlockTransactions;