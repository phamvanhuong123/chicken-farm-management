import { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
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

// Danh sách mẫu (tạm thời)
const SUPPLIERS = [
  { value: "trang-trai-abc", label: "Trang trại ABC" },
  { value: "cong-ty-xyz", label: "Công ty XYZ" },
  { value: "nong-trai-123", label: "Nông trại 123" },
];

const BREEDS = [
  { value: "ga-ta", label: "Gà ta" },
  { value: "ga-cong-nghiep", label: "Gà công nghiệp" },
  { value: "ga-ri", label: "Gà Ri" },
  { value: "ga-tam-hoang", label: "Gà Tam Hoàng" },
  { value: "ga-ai-cap", label: "Gà Ai Cập" },
];

const AREAS = [
  { value: "khu-a", label: "Khu A" },
  { value: "khu-b", label: "Khu B" },
  { value: "khu-c", label: "Khu C" },
  { value: "khu-d", label: "Khu D" },
];

function EditFlockModal({ isOpen, onClose, flockData, onUpdateSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    createdAt: "",
    supplierId: "",
    speciesId: "",
    initialCount: "",
    avgWeight: "",
    areaId: "",
    note: "",
  });

  // Gán dữ liệu khi mở modal
  useEffect(() => {
    if (flockData && isOpen) {
      const formattedDate = flockData.createdAt
        ? new Date(flockData.createdAt).toISOString().split("T")[0]
        : "";

      setFormData({
        createdAt: formattedDate,
        supplierId: flockData.supplierId || "",
        speciesId: flockData.speciesId || "",
        initialCount: flockData.initialCount?.toString() || "",
        avgWeight: flockData.avgWeight?.toString() || "",
        areaId: flockData.areaId || "",
        note: flockData.note || "",
      });

      setErrors({});
    }
  }, [flockData, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate đơn giản
  const validateForm = () => {
    const newErrors = {};

    if (!formData.createdAt) newErrors.createdAt = "Vui lòng chọn ngày nhập.";

    if (!formData.supplierId) newErrors.supplierId = "Vui lòng chọn nhà cung cấp.";

    if (!formData.speciesId) newErrors.speciesId = "Vui lòng chọn giống gà.";

    if (!formData.initialCount || Number(formData.initialCount) <= 0)
      newErrors.initialCount = "Số lượng phải lớn hơn 0.";

    if (!formData.avgWeight || Number(formData.avgWeight) <= 0)
      newErrors.avgWeight = "Trọng lượng TB phải lớn hơn 0.";

    if (!formData.areaId) newErrors.areaId = "Vui lòng chọn khu nuôi.";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        createdAt: new Date(formData.createdAt),
        supplierId: formData.supplierId,
        speciesId: formData.speciesId,
        initialCount: Number(formData.initialCount),
        avgWeight: Number(formData.avgWeight),
        areaId: formData.areaId,
        note: formData.note || undefined,
      };

      const response = await axios.put(
        `http://localhost:8071/v1/flocks/${flockData._id}`,
        updateData
      );

      if (response.data) {
        // Cập nhật bảng
        onUpdateSuccess && onUpdateSuccess(response.data.data);
        onClose();
      }
    } catch (error) {
      console.error("Lỗi cập nhật đàn:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const Star = <span className="text-red-600 font-bold">*</span>;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Chỉnh sửa thông tin đàn</span>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="mt-4 grid grid-cols-2 gap-4">

              {/* Ngày nhập */}
              <div className="space-y-2">
                <Label>Ngày nhập {Star}</Label>
                <Input
                  type="date"
                  value={formData.createdAt}
                  onChange={(e) => handleChange("createdAt", e.target.value)}
                  className={errors.createdAt ? "border-red-500" : ""}
                />
                {errors.createdAt && (
                  <p className="text-red-500 text-sm">{errors.createdAt}</p>
                )}
              </div>

              {/* Nhà cung cấp */}
              <div className="space-y-2">
                <Label>Nhà cung cấp {Star}</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => handleChange("supplierId", value)}
                >
                  <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Nhà cung cấp</SelectLabel>
                      {SUPPLIERS.map((supplier) => (
                        <SelectItem key={supplier.value} value={supplier.value}>
                          {supplier.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.supplierId && (
                  <p className="text-red-500 text-sm">{errors.supplierId}</p>
                )}
              </div>

              {/* Giống gà */}
              <div className="space-y-2">
                <Label>Giống gà {Star}</Label>
                <Select
                  value={formData.speciesId}
                  onValueChange={(value) => handleChange("speciesId", value)}
                >
                  <SelectTrigger className={errors.speciesId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn giống gà" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Giống gà</SelectLabel>
                      {BREEDS.map((breed) => (
                        <SelectItem key={breed.value} value={breed.value}>
                          {breed.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.speciesId && (
                  <p className="text-red-500 text-sm">{errors.speciesId}</p>
                )}
              </div>

              {/* Số lượng */}
              <div className="space-y-2">
                <Label>Số lượng {Star}</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.initialCount}
                  onChange={(e) => handleChange("initialCount", e.target.value)}
                  className={errors.initialCount ? "border-red-500" : ""}
                />
                {errors.initialCount && (
                  <p className="text-red-500 text-sm">{errors.initialCount}</p>
                )}
              </div>

              {/* Trọng lượng TB */}
              <div className="space-y-2">
                <Label>Trọng lượng TB (kg/con) {Star}</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.avgWeight}
                  onChange={(e) => handleChange("avgWeight", e.target.value)}
                  className={errors.avgWeight ? "border-red-500" : ""}
                />
                {errors.avgWeight && (
                  <p className="text-red-500 text-sm">{errors.avgWeight}</p>
                )}
              </div>

              {/* Khu nuôi */}
              <div className="space-y-2">
                <Label>Khu nuôi {Star}</Label>
                <Select
                  value={formData.areaId}
                  onValueChange={(value) => handleChange("areaId", value)}
                >
                  <SelectTrigger className={errors.areaId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn khu nuôi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Khu nuôi</SelectLabel>
                      {AREAS.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.areaId && (
                  <p className="text-red-500 text-sm">{errors.areaId}</p>
                )}
              </div>

              {/* Ghi chú */}
              <div className="col-span-2 space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  rows={3}
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                />
              </div>

            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditFlockModal;
