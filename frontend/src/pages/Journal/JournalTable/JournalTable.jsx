import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Droplet, Edit2, Heart, Pill, Scale, Skull, Trash2, Utensils, AlertTriangle } from "lucide-react";
import { cn } from "~/lib/utils";

// Import AlertDialog từ Shadcn UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useSelector } from 'react-redux';
import { getUserState } from '~/slices/authSlice';

// Cấu hình hiển thị Loại nhật ký
const DIARY_TYPES_CONFIG = {
  FOOD: { label: 'Thức ăn', color: 'text-red-500 bg-red-50', icon: Utensils },
  MEDICINE: { label: 'Thuốc', color: 'text-orange-500 bg-orange-50', icon: Pill },
  WATER: { label: 'Nước uống', color: 'text-blue-500 bg-blue-50', icon: Droplet },
  DEATH: { label: 'Tử vong', color: 'text-gray-500 bg-gray-50', icon: Skull },
  WEIGHT: { label: 'Trọng lượng', color: 'text-yellow-600 bg-yellow-50', icon: Scale },
  HEALTH: { label: 'Sức khỏe', color: 'text-pink-500 bg-pink-50', icon: Heart },
};

export const JournalTable = ({ data, onEdit, onDelete }) => {
  const user = useSelector(state => getUserState(state))
  console.log(user)
  // State lưu ID của item đang chờ xóa
  const [itemToDelete, setItemToDelete] = useState(null);

  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Hàm xử lý khi nhấn nút xác nhận xóa trong Dialog
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDelete(itemToDelete); // Gọi hàm xóa từ cha
      setItemToDelete(null);  // Đóng dialog
    }
  };
  
  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[120px]">Ngày</TableHead>
              <TableHead>Khu nuôi</TableHead>
              <TableHead>Loại hoạt động</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead className="w-[300px]">Ghi chú</TableHead>
              <TableHead>Người ghi</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                  Chưa có dữ liệu nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const config = DIARY_TYPES_CONFIG[item.type] || DIARY_TYPES_CONFIG.FOOD;
                const Icon = config.icon;
                const displayArea = item.areaName || item.areaId || "---";
                const displayRecorder = item.userName || item.recorder || "Admin";
                const displayDate = formatDate(item.createdAt || item.date);
                const recordId = item.id || item._id; // Lấy ID chuẩn

                return (
                  <TableRow key={recordId} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-700">{displayDate}</TableCell>
                    <TableCell className="font-bold text-gray-800">{displayArea}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <div className={cn("p-1.5 rounded-full", config.color.replace('text-', 'bg-').replace('500', '100'))}>
                            <Icon className={cn("w-4 h-4", config.color.split(' ')[0])} />
                         </div>
                         <span className="font-medium text-gray-700">{config.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-gray-900">{item.quantity}</span> <span className="text-gray-500 text-xs uppercase ml-1">{item.unit}</span>
                    </TableCell>
                    <TableCell className="text-gray-600 truncate max-w-[250px]" title={item.note}>
                      {item.note || "-"}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {displayRecorder}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 cursor-pointer text-blue-600 hover:bg-blue-50">
                          <Edit2 className="h-4 w-4 " />
                        </Button>
                        
                        {/* Nút xóa kích hoạt Dialog */}
                        {user.id === item.userId && <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setItemToDelete(recordId)} 
                            className="h-8 w-8 text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                         
                         <Trash2 className="h-4 w-4" />
                        </Button>} 
                        
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG CẢNH BÁO XÓA */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Xác nhận xóa nhật ký?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bản ghi nhật ký này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="bg-red-600 hover:bg-red-700 text-white"
            >
              Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};