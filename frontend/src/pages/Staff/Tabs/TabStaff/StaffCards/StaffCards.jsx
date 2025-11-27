import { CircleDollarSign, Eye, Mail, NotebookPen, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
function StaffCard() {
  return (
    <div className="grid max-[1280px]:grid-cols-2 max-[940px]:grid-cols-1  grid-cols-3 gap-4">
      {[...Array(4)].map(() => (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback className="bg-blue-400 text-[16px]">
                  VH
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Phạm Văn Hương</CardTitle>
                <CardDescription>Quản lí trang trại</CardDescription>
                <Badge className="bg-green-200 text-green-700">
                  Đang làm việc
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <Phone size={15} />
                <p style={{wordBreak : 'break-word'}}>0327707140</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <Mail size={15} />
                <p style={{wordBreak : 'break-word'}}>phamvanhuongtk@gmail.com</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <CircleDollarSign size={15} />
                <p style={{wordBreak : 'break-word'}}>15.000.000 VNĐ/Tháng</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-between">
            <p>Gia nhập : 2023-02-28</p>
            <div className="flex gap-1">
              <button className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-[7px]">
                <Eye size={18} />
              </button>
              <button className="cursor-pointer hover:bg-gray-100 p-1.5 rounded-[7px] ">
                <NotebookPen size={18} />
              </button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
export default StaffCard;
