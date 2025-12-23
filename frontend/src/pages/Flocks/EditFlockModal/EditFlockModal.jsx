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
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// Danh sách mẫu (có thể lấy từ API sau)
const SUPPLIERS = [
  { value: "trang-trai-abc", label: "Trang trại ABC" },
  { value: "cong-ty-xyz", label: "Công ty XYZ" },
  { value: "nong-trai-123", label: "Nông trại 123" },
];

const BREEDS = [
  { value: "ga-ta", label: "Gà ta" },
  { value: "ga-cong-nghiep", label: "Gà công nghiệp" },
  { value: "ga-ri", label: "Gà thả vườn" },
];

// ================= FIX STATUS MAP =================
const STATUS_REVERSE_MAP = {
  Raising: "active",
  Sold: "selling",
};

const STATUS_MAP = {
  active: "Raising",
  selling: "Sold",
};

function EditFlockModal({ isOpen, onClose, flockData, onUpdateSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [areas, setAreas] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    createdAt: "",
    supplierId: "",
    speciesId: "",
    initialCount: "",
    avgWeight: "",
    areaId: "",
    status: "active",
    note: "",
  });

  // State khu nuôi
  useEffect(() => {
    if (!isOpen) return;

    const fetchAreas = async () => {
      try {
        const res = await axios.get("http://localhost:8071/v1/areas");
        setAreas(res.data.data);
      } catch (error) {
        console.error("Lỗi lấy khu nuôi:", error);
        toast.error("Không thể tải danh sách khu nuôi");
      }
    };

    fetchAreas();
  }, [isOpen]);

  // Populate form khi flockData thay đổi
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
        areaId: flockData.areaId?._id || "",
        status: STATUS_REVERSE_MAP[flockData.status] || "active",
        note: flockData.note || "",
      });

      setErrors({});
      setSuccessMessage("");
    }
  }, [flockData, isOpen]);

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
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (!formData.createdAt) {
      newErrors.createdAt = "Vui lòng chọn ngày nhập.";
    } else {
      const inputDate = new Date(formData.createdAt);
      if (inputDate > today) {
        newErrors.createdAt = "Ngày nhập không hợp lệ.";
      }
    }

    if (!formData.supplierId)
      newErrors.supplierId = "Vui lòng chọn nhà cung cấp.";

    if (!formData.speciesId)
      newErrors.speciesId = "Vui lòng chọn giống gà.";

    if (!formData.initialCount)
      newErrors.initialCount = "Vui lòng nhập số lượng.";
    else if (Number(formData.initialCount) <= 0)
      newErrors.initialCount = "Số lượng phải lớn hơn 0.";

    if (!formData.avgWeight)
      newErrors.avgWeight = "Vui lòng nhập trọng lượng trung bình.";
    else if (Number(formData.avgWeight) <= 0)
      newErrors.avgWeight = "Trọng lượng trung bình phải lớn hơn 0.";

    if (!formData.areaId)
      newErrors.areaId = "Vui lòng chọn khu nuôi.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    const isValid = validateForm();
    if (!isValid) return;

    setLoading(true);
    try {
      const updateData = {
        createdAt: new Date(formData.createdAt),
        supplierId: formData.supplierId,
        speciesId: formData.speciesId,
        initialCount: Number(formData.initialCount),
        avgWeight: Number(formData.avgWeight),
        areaId: formData.areaId,
        status: STATUS_MAP[formData.status],
        note: formData.note || undefined,
      };

      const response = await axios.put(
        `http://localhost:8071/v1/flocks/${flockData._id}`,
        updateData
      );

      toast.success("Cập nhật thông tin đàn thành công.");
      setSuccessMessage("Cập nhật thông tin đàn thành công!");

      setTimeout(() => {
        onUpdateSuccess({
          ...flockData,
          ...updateData
        });
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Lỗi cập nhật đàn:", error);
      toast.error(
        error.response?.data?.message ||
        "Không thể cập nhật đàn, vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setErrors({});
    setSuccessMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <AlertDialogContent className="max-w-[600px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <AlertDialogHeader className="p-6 pb-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <AlertDialogTitle>Chỉnh sửa thông tin đàn</AlertDialogTitle>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </AlertDialogHeader>

        {/* Phần nội dung chính - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Ngày nhập */}
                <div className="col-span-1 space-y-2">
                  <Label>Ngày nhập <span className="text-red-500">*</span></Label>
                  <Input
                    type="date"
                    value={formData.createdAt}
                    onChange={(e) => handleChange("createdAt", e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className={errors.createdAt ? "border-red-500" : ""}
                  />
                  {errors.createdAt && (
                    <p className="text-red-500 text-sm">{errors.createdAt}</p>
                  )}
                </div>

                {/* Nhà cung cấp */}
                <div className="col-span-1 space-y-2">
                  <Label>Nhà cung cấp <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => handleChange("supplierId", value)}
                  >
                    <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectGroup>
                        {SUPPLIERS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
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
                <div className="col-span-1 space-y-2">
                  <Label>Giống gà <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.speciesId}
                    onValueChange={(value) => handleChange("speciesId", value)}
                  >
                    <SelectTrigger className={errors.speciesId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn giống gà" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectGroup>
                        {BREEDS.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.speciesId && (
                    <p className="text-red-500 text-sm">{errors.speciesId}</p>
                  )}
                </div>

                {/* Số lượng ban đầu */}
                <div className="col-span-1 space-y-2">
                  <Label>Số lượng ban đầu <span className="text-red-500">*</span></Label>
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
                <div className="col-span-1 space-y-2">
                  <Label>Trọng lượng TB (kg/con) <span className="text-red-500">*</span></Label>
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

                {/* Khu nuôi - QUAN TRỌNG: Dropdown có scroll */}
                <div className="col-span-1 space-y-2">
                  <Label>Khu nuôi <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.areaId}
                    onValueChange={(v) => handleChange("areaId", v)}
                  >
                    <SelectTrigger className={errors.areaId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn khu nuôi" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectGroup>
                        {areas.map((a) => (
                          <SelectItem key={a._id} value={a._id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.areaId && (
                    <p className="text-red-500 text-sm">{errors.areaId}</p>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="col-span-1 space-y-2">
                  <Label>Trạng thái <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => handleChange("status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      <SelectGroup>
                        <SelectItem value="active">Đang nuôi</SelectItem>
                        <SelectItem value="selling">Đang bán</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ghi chú */}
                <div className="col-span-2 space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    rows={3}
                    value={formData.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    placeholder="Nhập ghi chú (tùy chọn)"
                  />
                </div>
              </div>

              {/* Thông báo thành công */}
              {successMessage && (
                <div className="mt-4 w-full p-3 text-green-700 bg-green-100 border border-green-300 rounded-md text-center">
                  {successMessage}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </div>

        {/* Footer */}
        <AlertDialogFooter className="p-6 pt-4 border-t bg-white">
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
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default EditFlockModal;