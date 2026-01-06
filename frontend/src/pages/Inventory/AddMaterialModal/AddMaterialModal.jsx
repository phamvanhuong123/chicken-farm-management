import { useState } from "react";
import { X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { materialAPI } from "~/apis/material.api";

// Danh sách mẫu
const MATERIAL_TYPES = [
  { value: "Thức ăn", label: "Thức ăn" },
  { value: "Thuốc", label: "Thuốc" },
  { value: "Vắc-xin", label: "Vắc-xin" },
  { value: "Dụng cụ", label: "Dụng cụ" },
  { value: "Khác", label: "Khác" },
];

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "lít", label: "lít" },
  { value: "chai", label: "chai" },
  { value: "bao", label: "bao" },
  { value: "hộp", label: "hộp" },
  { value: "cái", label: "cái" },
  { value: "viên", label: "viên" },
];

function AddMaterialModal({ isOpen, onClose, onAddSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    unit: "",
    quantity: "",
    threshold: "",
    importDate: "",
    expiryDate: "",
    price: "",

    supplier: "",
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      unit: "",
      quantity: "",
      threshold: "",
      importDate: "",
      expiryDate: "",
      price: "",
      supplier: "",
    });
    setErrors({});
  };

  // Handle input change
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Tên vật tư - bắt buộc
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên vật tư.";
    }

    // Loại - bắt buộc
    if (!formData.type) {
      newErrors.type = "Vui lòng chọn loại vật tư.";
    }

    // Đơn vị - bắt buộc
    if (!formData.unit) {
      newErrors.unit = "Vui lòng chọn đơn vị.";
    }

    // Số lượng - bắt buộc, > 0
    if (!formData.quantity) {
      newErrors.quantity = "Vui lòng nhập số lượng.";
    } else if (Number(formData.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0.";
    }

    // Ngưỡng cảnh báo - bắt buộc, > 0
    if (!formData.threshold) {
      newErrors.threshold = "Vui lòng nhập ngưỡng cảnh báo.";
    } else if (Number(formData.threshold) <= 0) {
      newErrors.threshold = "Ngưỡng cảnh báo phải lớn hơn 0.";
    }

    // Hạn sử dụng - bắt buộc
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Vui lòng chọn hạn sử dụng.";
    }

    // Giá - nếu nhập phải > 0
    if (formData.price && Number(formData.price) <= 0) {
      newErrors.price = "Giá phải lớn hơn 0.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Vui lòng điền đầy đủ và hợp lệ thông tin bắt buộc.");
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const materialData = {
        name: formData.name.trim(),
        type: formData.type,
        unit: formData.unit,
        quantity: Number(formData.quantity),
        threshold: Number(formData.threshold),
        expiryDate: formData.expiryDate,
        // Optional fields
        ...(formData.importDate && {
          importDate: new Date(formData.importDate),
        }),
        ...(formData.price && { price: Number(formData.price) }),
        ...(formData.supplier && { supplier: formData.supplier.trim() }),
      };

      const response = await materialAPI.create(materialData);

      if (response.data) {
        toast.success("Thêm vật tư thành công.");
        onAddSuccess && onAddSuccess(response.data.data);
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Lỗi thêm vật tư:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể lưu vật tư, vui lòng thử lại sau.";
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

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-[650px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Thêm vật tư mới</span>
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
                {/* Tên vật tư */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name">
                    Tên vật tư <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nhập tên vật tư"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Loại */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="type">
                    Loại <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger
                      className={errors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn loại vật tư" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Loại vật tư</SelectLabel>
                        {MATERIAL_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type}</p>
                  )}
                </div>

                {/* Đơn vị */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="unit">
                    Đơn vị <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => handleChange("unit", value)}
                  >
                    <SelectTrigger
                      className={errors.unit ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Chọn đơn vị" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Đơn vị</SelectLabel>
                        {UNITS.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.unit && (
                    <p className="text-red-500 text-sm">{errors.unit}</p>
                  )}
                </div>

                {/* Số lượng */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="quantity">
                    Số lượng <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="Nhập số lượng"
                    value={formData.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className={errors.quantity ? "border-red-500" : ""}
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm">{errors.quantity}</p>
                  )}
                </div>

                {/* Ngưỡng cảnh báo */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="threshold">
                    Ngưỡng cảnh báo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    placeholder="Nhập ngưỡng cảnh báo"
                    value={formData.threshold}
                    onChange={(e) => handleChange("threshold", e.target.value)}
                    className={errors.threshold ? "border-red-500" : ""}
                  />
                  {errors.threshold && (
                    <p className="text-red-500 text-sm">{errors.threshold}</p>
                  )}
                </div>

                {/* Ngày nhập */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="importDate">Ngày nhập</Label>
                  <Input
                    id="importDate"
                    type="date"
                    value={formData.importDate}
                    onChange={(e) => handleChange("importDate", e.target.value)}
                  />
                </div>

                {/* Hạn sử dụng */}
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="expiryDate">
                    Hạn sử dụng (HSD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange("expiryDate", e.target.value)}
                    className={errors.expiryDate ? "border-red-500" : ""}
                  />
                  {errors.expiryDate && (
                    <p className="text-red-500 text-sm">{errors.expiryDate}</p>
                  )}
                </div>

               

                {/* Nhà cung cấp */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="supplier">Nhà cung cấp</Label>
                  <Input
                    id="supplier"
                    type="text"
                    placeholder="Nhập tên nhà cung cấp (tùy chọn)"
                    value={formData.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                  />
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
            {loading ? "Đang lưu..." : "Thêm vật tư"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddMaterialModal;
