import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  fetchDeleteEmployeeApi,
  getLoadingState,
} from "~/slices/employeeSlice";

function DeleteButton({ id }) {
  const dispatch = useDispatch();
  const loading = useSelector((state) => getLoadingState(state));

  const [open, setOpen] = useState(false);
  const handleDelete = async () => {
    console.log(id);
    setOpen(false);
    try {
      await dispatch(fetchDeleteEmployeeApi(id)).unwrap();
      toast.success("Xoá thành công");
      setOpen(false);
    } catch {
      toast.error("Xoá thất bại");
    }
  };
  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <button className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-[7px] text-red-600">
            <Trash2 size={18} />
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá nhân viên này? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Hủy
            </AlertDialogCancel>

            {/* Chỉ UI, không có logic */}
            <Button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              Xoá {loading && <ClipLoader color="white" size={15} />}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DeleteButton;
