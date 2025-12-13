import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { transactionAPI } from "~/apis/transaction.api";
import { flockApi } from "~/apis/flockApi";
import { areaApi } from "~/apis/areaApi";
// Danh sách mẫu
const TRANSACTION_TYPES = [
  { value: "Bán", label: "Bán" },
  { value: "Tặng", label: "Tặng" },
  { value: "Tiêu hủy", label: "Tiêu hủy" },
];

const PAYMENT_METHODS = [
  { value: "Tiền mặt", label: "Tiền mặt" },
  { value: "Chuyển khoản", label: "Chuyển khoản" },
];

function ExportTransactions({ isOpen, onClose, flocks, onExportSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split("T")[0],
    flockId: "",
    quantity: "",
    avgWeight: "",
    pricePerKg: "",
    customerName: "",
    transactionType: "Bán",
    paymentMethod: "Tiền mặt",
    note: "",
  });

  // Đàn được chọn
  const [selectedFlock, setSelectedFlock] = useState(null);

  // Reset form
  const resetForm = () => {
    setFormData({
      transactionDate: new Date().toISOString().split("T")[0],
      flockId: "",
      quantity: "",
      avgWeight: "",
      pricePerKg: "",
      customerName: "",
      transactionType: "Bán",
      paymentMethod: "Tiền mặt",
      note: "",
    });
    setSelectedFlock(null);
    setErrors({});
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Khi chọn đàn, cập nhật trọng lượng TB mặc định
    if (field === "flockId") {
      const flock = flocks.find((f) => f._id === value);
      setSelectedFlock(flock);
      if (flock) {
        setFormData((prev) => ({
          ...prev,
          flockId: value,
          avgWeight: flock.avgWeight?.toString() || "",
        }));
      }
    }
  };

  // Tính doanh thu
  const calculateRevenue = () => {
    const qty = Number(formData.quantity) || 0;
    const weight = Number(formData.avgWeight) || 0;
    const price = Number(formData.pricePerKg) || 0;
    return qty * weight * price;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Ngày xuất
    if (!formData.transactionDate) {
      newErrors.transactionDate = "Vui lòng chọn ngày xuất.";
    } else if (new Date(formData.transactionDate) > today) {
      newErrors.transactionDate = "Ngày xuất không được lớn hơn ngày hiện tại.";
    }

    // Đàn gà
    if (!formData.flockId) {
      newErrors.flockId = "Vui lòng chọn đàn gà.";
    }

    // Số lượng
    if (!formData.quantity) {
      newErrors.quantity = "Vui lòng nhập số lượng.";
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0.";
    } else if (selectedFlock && Number(formData.quantity) > selectedFlock.currentCount) {
      newErrors.quantity = "Số lượng vượt quá số gà còn lại.";
    }

    // Trọng lượng TB
    if (!formData.avgWeight) {
      newErrors.avgWeight = "Vui lòng nhập trọng lượng TB.";
    } else if (Number(formData.avgWeight) <= 0) {
      newErrors.avgWeight = "Trọng lượng phải lớn hơn 0.";
    }

    // Giá/kg
    if (!formData.pricePerKg) {
      newErrors.pricePerKg = "Vui lòng nhập giá/kg.";
    } else if (Number(formData.pricePerKg) <= 0) {
      newErrors.pricePerKg = "Giá phải lớn hơn 0.";
    }

    // Khách hàng
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Vui lòng nhập tên khách hàng.";
    }

    // Loại giao dịch
    if (!formData.transactionType) {
      newErrors.transactionType = "Vui lòng chọn loại giao dịch.";
    }

    // Phương thức thanh toán
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán.";
    }

    // Ghi chú (max 255 ký tự)
    if (formData.note && formData.note.length > 255) {
      newErrors.note = "Ghi chú tối đa 255 ký tự.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // 1. Tạo ExportRecord (hiện tại)
      const exportData = {
        transactionDate: formData.transactionDate,
        flockId: formData.flockId,
        quantity: parseInt(formData.quantity),
        avgWeight: parseFloat(formData.avgWeight),
        pricePerKg: parseFloat(formData.pricePerKg),
        customerName: formData.customerName,
        transactionType: formData.transactionType,
        paymentMethod: formData.paymentMethod,
        note: formData.note,
        totalRevenue: calculateRevenue(),
        status: "Đang xử lý" 
      };      
      const exportRes = await transactionAPI.createExport(exportData);
      
      // 2. Cập nhật Flock (giảm currentCount)
      const flockId = formData.flockId;
      const selectedFlock = flocks.find(f => f._id === flockId);
      
      if (selectedFlock) {
        const updatedFlockData = {
          currentCount: selectedFlock.currentCount - parseInt(formData.quantity),
          status: (selectedFlock.currentCount - parseInt(formData.quantity) <= 0) 
                  ? "Sold" 
                  : "Raising"
        };
        await flockApi.update(flockId, updatedFlockData);
      }
      
      // 3. Cập nhật Area (giảm currentCapacity)
      if (selectedFlock && selectedFlock.areaId) {
        try {
          // Lấy danh sách areas và tìm area có code = areaId
          const areasRes = await areaApi.getAll();
          const areas = areasRes.data?.data || areasRes.data || [];
          
          // Tìm area bằng code (A001, A002, ...)
          const area = areas.find(a => a.code === selectedFlock.areaId);
          
          if (area) {
            const updatedAreaData = {
              currentCapacity: Math.max(0, (area.currentCapacity || 0) - parseInt(formData.quantity))
            };
            
            // Gọi API cập nhật với _id thực của area
            await areaApi.update(area._id, updatedAreaData);
          } else {
            console.warn(`Không tìm thấy area với code: ${selectedFlock.areaId}`);
          }
        } catch (areaError) {
          console.error("Lỗi khi cập nhật area:", areaError);
          // Không throw error để không ảnh hưởng đến tạo export
        }
      }
      
      // 4. Success handling
      toast.success("Tạo đơn xuất thành công.");
      onExportSuccess && onExportSuccess(exportRes.data.data);
      resetForm();
      onClose();
      
    } catch (error) {
      console.error("Lỗi tạo đơn xuất:", error);
      const errorMessage = error.response?.data?.message || "Không thể lưu đơn hàng.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Lọc đàn đang nuôi
  const activeFlocks = flocks.filter(
    (f) => f.status === "Raising" || f.status === "Đang nuôi"
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-[650px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Tạo đơn xuất chuồng mới</span>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Ngày xuất */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="transactionDate">
                    Ngày xuất <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => handleChange("transactionDate", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.transactionDate ? "border-red-500" : ""}
                  />
                  {errors.transactionDate && (
                    <p className="text-red-500 text-sm">{errors.transactionDate}</p>
                  )}
                </div>

                {/* Đàn gà */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="flockId">
                    Đàn gà <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.flockId}
                    onValueChange={(value) => handleChange("flockId", value)}
                  >
                    <SelectTrigger className={errors.flockId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn đàn gà" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Đàn đang nuôi</SelectLabel>
                        {activeFlocks.map((flock) => (
                          <SelectItem key={flock._id} value={flock._id}>
                            {flock.code || flock._id} - {flock.speciesId} ({flock.currentCount} con)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.flockId && (
                    <p className="text-red-500 text-sm">{errors.flockId}</p>
                  )}
                  {selectedFlock && (
                    <p className="text-sm text-gray-500">
                      Còn lại: <span className="font-medium">{selectedFlock.currentCount}</span> con
                    </p>
                  )}
                </div>

                {/* Số lượng */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="quantity">
                    Số lượng (con) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedFlock?.currentCount || undefined}
                    placeholder="Nhập số lượng"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">{errors.quantity}</p>
                  )}
                </div>

                {/* Trọng lượng TB */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="avgWeight">
                    Trọng lượng TB (kg/con) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="avgWeight"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Nhập trọng lượng"
                    value={formData.avgWeight}
                    onChange={(e) => handleChange("avgWeight", e.target.value)}
                    className={errors.avgWeight ? "border-red-500" : ""}
                  />
                  {errors.avgWeight && (
                    <p className="text-red-500 text-sm">{errors.avgWeight}</p>
                  )}
                </div>

                {/* Giá/kg */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="pricePerKg">
                    Giá/kg (VNĐ) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pricePerKg"
                    type="number"
                    min="0"
                    placeholder="Nhập giá/kg"
                    value={formData.pricePerKg}
                    onChange={(e) => handleChange("pricePerKg", e.target.value)}
                    className={errors.pricePerKg ? "border-red-500" : ""}
                  />
                  {errors.pricePerKg && (
                    <p className="text-red-500 text-sm">{errors.pricePerKg}</p>
                  )}
                </div>

                {/* Khách hàng */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="customerName">
                    Khách hàng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customerName"
                    type="text"
                    placeholder="Nhập tên khách hàng"
                    value={formData.customerName}
                    onChange={(e) => handleChange("customerName", e.target.value)}
                    className={errors.customerName ? "border-red-500" : ""}
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm">{errors.customerName}</p>
                  )}
                </div>

                {/* Loại giao dịch */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="transactionType">
                    Loại giao dịch <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.transactionType}
                    onValueChange={(value) => handleChange("transactionType", value)}
                  >
                    <SelectTrigger className={errors.transactionType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn loại giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TRANSACTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.transactionType && (
                    <p className="text-red-500 text-sm">{errors.transactionType}</p>
                  )}
                </div>

                {/* Phương thức thanh toán */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="paymentMethod">
                    Phương thức thanh toán <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleChange("paymentMethod", value)}
                  >
                    <SelectTrigger className={errors.paymentMethod ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn phương thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                  )}
                </div>

                {/* Doanh thu dự kiến */}
                <div className="col-span-2 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Doanh thu dự kiến:</p>
                  <p className="text-xl font-bold text-green-600">
                    {calculateRevenue().toLocaleString("vi-VN")} VNĐ
                  </p>
                </div>

                {/* Ghi chú */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="note">Ghi chú (tối đa 255 ký tự)</Label>
                  <Textarea
                    id="note"
                    placeholder="Nhập ghi chú (tùy chọn)"
                    value={formData.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    maxLength={255}
                    rows={3}
                    className={errors.note ? "border-red-500" : ""}
                  />
                  {errors.note && (
                    <p className="text-red-500 text-sm">{errors.note}</p>
                  )}
                  <p className="text-xs text-gray-400 text-right">
                    {formData.note.length}/255
                  </p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 cursor-pointer"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ExportTransactions;