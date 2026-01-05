import { useRef, useState } from "react";
import { X, Printer, Download, CheckCircle, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { transactionAPI } from "~/apis/transaction.api";
import { toast } from "react-toastify";

import { financeApi } from "~/apis/financeApi";

function InvoicePreviewModal({ isOpen, onClose, transaction, onStatusChange }) {
  const invoiceRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !transaction) return null;

  // Format helpers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("vi-VN") + "₫";
  };

  // Số tiền bằng chữ (simplified)
  const numberToWords = (num) => {
    const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const tens = ["", "mười", "hai mươi", "ba mươi", "bốn mươi", "năm mươi", "sáu mươi", "bảy mươi", "tám mươi", "chín mươi"];
    
    if (num === 0) return "không đồng";
    
    const groups = [];
    let n = Math.floor(num);
    
    while (n > 0) {
      groups.push(n % 1000);
      n = Math.floor(n / 1000);
    }
    
    const groupNames = ["", " nghìn", " triệu", " tỷ"];
    const result = groups.map((g, i) => {
      if (g === 0) return "";
      const hundreds = Math.floor(g / 100);
      const tensDigit = Math.floor((g % 100) / 10);
      const unitsDigit = g % 10;
      
      let str = "";
      if (hundreds > 0) str += units[hundreds] + " trăm ";
      if (tensDigit > 0) str += tens[tensDigit] + " ";
      if (unitsDigit > 0) str += units[unitsDigit];
      
      return str.trim() + groupNames[i];
    }).reverse().join(" ").trim();
    
    return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  };

  // Print handler - print only invoice content
  const handlePrint = () => {
    const printContent = invoiceRef.current;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn xuất chuồng - ${transaction.invoiceNumber || transaction._id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; padding: 20px; }
            .invoice { max-width: 800px; margin: auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .subtitle { font-size: 14px; color: #666; }
            .company-info, .customer-info { margin: 10px 0; }
            .info-label { font-weight: bold; }
            .info-row { display: flex; margin: 5px 0; }
            .info-row span:first-child { width: 150px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #333; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-row { font-weight: bold; font-size: 16px; }
            .amount-words { font-style: italic; margin: 10px 0; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; text-align: center; }
            .signature { width: 200px; }
            .signature-line { margin-top: 60px; border-top: 1px dotted #333; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Export PDF handler (backend)
  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.exportInvoice(transaction._id);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `hoa-don-${transaction.invoiceNumber || transaction._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Tải hóa đơn PDF thành công!");
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      toast.error("Không thể xuất PDF. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Update status
  const handleComplete = async () => {
    try{

      await onStatusChange(transaction._id, "Hoàn thành");  
      const payload = {
          date: new Date(),
          type: "income",
          category: "Bán hàng",
          amount: Number(transaction?.totalRevenue),
          flockId: transaction?.flockId || null,
          description: "Xuất đàn",
        };
        toast.success("Xuất đàn thành công")
        await financeApi.createTransaction(payload);
      onClose();
    }
    catch(error){
      toast.error("Xuất đàn thất bại : " + error)
    }
    
  };

  const handleCancel = async () => {
    if (onStatusChange) {
      await onStatusChange(transaction._id, "Đã hủy");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-bold">Xem hóa đơn xuất chuồng</h2>
          <div className="flex items-center gap-2">
            {transaction.status === "Đang xử lý" && (
              <>
                <Button
                  onClick={handleComplete}
                  className="bg-green-500 hover:bg-green-600 cursor-pointer"
                  size="sm"
                >
                  <CheckCircle size={16} className="mr-1" />
                  Hoàn thành
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="destructive"
                  className="cursor-pointer"
                  size="sm"
                >
                  <XCircle size={16} className="mr-1" />
                  Hủy đơn
                </Button>
              </>
            )}
            <Button onClick={handlePrint} variant="outline" className="cursor-pointer" size="sm">
              <Printer size={16} className="mr-1" />
              In
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="cursor-pointer"
              size="sm"
              disabled={loading}
            >
              <Download size={16} className="mr-1" />
              {loading ? "Đang tải..." : "PDF"}
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div ref={invoiceRef} className="invoice">
            {/* Company Header */}
            <div className="header text-center mb-6">
              <h1 className="text-xl font-bold uppercase">TRANG TRẠI GÀ ABC</h1>
              <p className="text-gray-600 text-sm">Địa chỉ: 123 Đường XYZ, Huyện ABC, Tỉnh DEF</p>
              <p className="text-gray-600 text-sm">Điện thoại: 0123 456 789 | Email: trangtrai@abc.vn</p>
              <hr className="my-4" />
              <h2 className="text-2xl font-bold uppercase mt-4">HÓA ĐƠN XUẤT CHUỒNG</h2>
              <p className="text-gray-500">
                Số: <span className="font-semibold">{transaction.invoiceNumber || `HD-${transaction._id.slice(-8).toUpperCase()}`}</span>
              </p>
              <p className="text-gray-500">Ngày: {formatDate(transaction.transactionDate)}</p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <p><span className="font-semibold">Khách hàng:</span> {transaction.customerName}</p>
                <p><span className="font-semibold">Địa chỉ:</span> {transaction.customerAddress || "—"}</p>
                <p><span className="font-semibold">SĐT:</span> {transaction.customerPhone || "—"}</p>
              </div>
              <div className="space-y-1">
                <p><span className="font-semibold">Loại giao dịch:</span> {transaction.transactionType}</p>
                <p><span className="font-semibold">Hình thức TT:</span> {transaction.paymentMethod}</p>
                <p><span className="font-semibold">Trạng thái:</span> 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    transaction.status === "Hoàn thành" ? "bg-green-100 text-green-700" :
                    transaction.status === "Đã hủy" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {transaction.status}
                  </span>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">STT</th>
                  <th className="border p-2 text-left">Mã đàn</th>
                  <th className="border p-2 text-center">Số lượng (con)</th>
                  <th className="border p-2 text-center">TL trung bình (kg)</th>
                  <th className="border p-2 text-center">Tổng TL (kg)</th>
                  <th className="border p-2 text-right">Đơn giá/kg</th>
                  <th className="border p-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1</td>
                  <td className="border p-2 font-medium">{transaction.flockCode}</td>
                  <td className="border p-2 text-center">{transaction.quantity}</td>
                  <td className="border p-2 text-center">{transaction.avgWeight}</td>
                  <td className="border p-2 text-center">{(transaction.quantity * transaction.avgWeight).toFixed(1)}</td>
                  <td className="border p-2 text-right">{formatCurrency(transaction.pricePerKg)}</td>
                  <td className="border p-2 text-right font-semibold">{formatCurrency(transaction.totalRevenue)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="6" className="border p-2 text-right">TỔNG CỘNG:</td>
                  <td className="border p-2 text-right text-lg text-green-600">{formatCurrency(transaction.totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Amount in words */}
            <p className="italic text-gray-700 mb-4">
              <span className="font-semibold">Bằng chữ:</span> {numberToWords(transaction.totalRevenue)}
            </p>

            {/* Notes */}
            {transaction.notes && (
              <div className="bg-gray-50 p-3 rounded mb-6">
                <p className="font-semibold">Ghi chú:</p>
                <p className="text-gray-600">{transaction.notes}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-4 mt-12 text-center">
              <div>
                <p className="font-semibold">Người lập phiếu</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="mt-16 border-t border-dashed pt-2">
                  {transaction.createdBy || "—"}
                </div>
              </div>
              <div>
                <p className="font-semibold">Khách hàng</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="mt-16 border-t border-dashed pt-2">
                  {transaction.customerName}
                </div>
              </div>
              <div>
                <p className="font-semibold">Thủ kho</p>
                <p className="text-sm text-gray-500">(Ký, ghi rõ họ tên)</p>
                <div className="mt-16 border-t border-dashed pt-2">
                  —
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Ngày in: {formatDateTime(new Date())}</p>
              <p>Hệ thống Quản lý Trang trại Gà v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePreviewModal;
