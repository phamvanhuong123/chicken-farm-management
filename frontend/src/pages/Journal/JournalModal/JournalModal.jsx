import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// UI Components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { Droplet, Heart, Pill, Scale, Skull, Utensils } from 'lucide-react';

// Cấu hình UI cho các loại hoạt động
const DIARY_TYPES_CONFIG = {
  FOOD: { label: 'Thức ăn', color: 'text-red-500 bg-red-50', icon: Utensils },
  MEDICINE: { label: 'Thuốc', color: 'text-orange-500 bg-orange-50', icon: Pill },
  WATER: { label: 'Nước uống', color: 'text-blue-500 bg-blue-50', icon: Droplet },
  DEATH: { label: 'Tử vong', color: 'text-gray-500 bg-gray-50', icon: Skull },
  WEIGHT: { label: 'Trọng lượng', color: 'text-yellow-600 bg-yellow-50', icon: Scale },
  HEALTH: { label: 'Sức khỏe', color: 'text-pink-500 bg-pink-50', icon: Heart },
};

// --- VALIDATION SCHEMA ---
const formSchema = z.object({
  areaId: z.string().min(1, "Vui lòng chọn khu nuôi"),
  type: z.enum(['FOOD', 'MEDICINE', 'WATER', 'DEATH', 'WEIGHT', 'HEALTH']),
  quantity: z.coerce.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unit: z.string().min(1, "Đơn vị tính"),
  note: z.string().optional(),
});

// Giá trị mặc định
const DEFAULT_VALUES = {
  areaId: '',
  type: 'FOOD',
  quantity: 0,
  unit: 'kg',
  note: ''
};

// Component Modal nhận props: areas (danh sách khu), initialData (dữ liệu sửa)
export const JournalModal = ({ open, onOpenChange, onSubmit, initialData, areas = [] }) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_VALUES
  });

  const selectedType = watch('type');

  // --- EFFECT: Reset form khi mở Modal ---
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Chế độ Sửa: Fill dữ liệu cũ
        reset({
          areaId: initialData.areaId, // ID khu vực (MongoDB ObjectId)
          type: initialData.type,
          quantity: Number(initialData.quantity),
          unit: initialData.unit,
          note: initialData.note || ''
        });
      } else {
        // Chế độ Thêm mới: Reset về mặc định
        reset(DEFAULT_VALUES);
      }
    }
  }, [open, initialData, reset]);

  // Tự động điền đơn vị tính khi chọn Loại
  const handleTypeSelect = (type) => {
    setValue('type', type);
    const autoUnits = {
      FOOD: 'kg', MEDICINE: 'liều', WATER: 'lít', 
      DEATH: 'con', WEIGHT: 'kg', HEALTH: 'con'
    };
    setValue('unit', autoUnits[type]);
  };

  const onFormSubmit = (data) => {
    // Gửi data ra ngoài cho Journal.jsx xử lý (Gọi API)
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-700">
            {initialData ? 'Cập nhật nhật ký' : 'Thêm nhật ký mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5 py-2">
          
          {/* Hàng 1: Khu vực (Lấy từ API areas) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Khu nuôi <span className="text-red-500">*</span></label>
            <Select 
              onValueChange={(val) => setValue('areaId', val)} 
              defaultValue={initialData?.areaId}
              // Key quan trọng: Giúp React render lại component Select khi chuyển đổi giữa Thêm/Sửa
              key={initialData ? (initialData._id || initialData.id) : 'new'} 
            >
              <SelectTrigger className={cn(errors.areaId && "border-red-500 focus:ring-red-500")}>
                <SelectValue placeholder="Chọn khu nuôi" />
              </SelectTrigger>
              <SelectContent>
                {areas.length === 0 ? (
                    <SelectItem value="disabled" disabled>Đang tải danh sách...</SelectItem>
                ) : (
                    areas.map((area) => (
                      <SelectItem key={area._id} value={area._id}>
                        {area.name}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
            {errors.areaId && <p className="text-red-500 text-xs mt-1">{errors.areaId.message}</p>}
          </div>

          {/* Hàng 2: Loại hoạt động */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Loại hoạt động <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(DIARY_TYPES_CONFIG).map((type) => {
                const config = DIARY_TYPES_CONFIG[type];
                const Icon = config.icon;
                const isSelected = selectedType === type;
                
                return (
                  <div
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className={cn(
                      "cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all hover:bg-gray-50",
                      isSelected 
                        ? "border-green-600 bg-green-50 ring-1 ring-green-600 shadow-sm" 
                        : "border-gray-200"
                    )}
                  >
                    <div className={cn("p-2 rounded-full", config.color.replace('text-', 'bg-').replace('500', '100'))}>
                       <Icon className={cn("w-5 h-5", config.color.split(' ')[0])} />
                    </div>
                    <span className={cn("text-sm font-medium", isSelected ? "text-green-700" : "text-gray-600")}>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Hàng 3: Số lượng & Đơn vị */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Số lượng <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
                <Input type="number" step="0.01" {...register('quantity')} className="flex-1" placeholder="0.00" />
                <div className="w-24 bg-gray-100 rounded-md border flex items-center justify-center text-sm text-gray-600">
                    {watch('unit') || '...'}
                </div>
            </div>
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>

          {/* Hàng 4: Ghi chú */}
          <div className="space-y-2">
             <label className="text-sm font-semibold text-gray-700">Ghi chú thêm</label>
             <Textarea {...register('note')} rows={3} placeholder="Nhập ghi chú chi tiết..." />
          </div>

          <DialogFooter className="pt-4 border-t ">
            <Button variant="outline" type="button" className={"cursor-pointer"} onClick={() => onOpenChange(false)}>Hủy</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                {initialData ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};