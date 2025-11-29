import { CircleDollarSign, Eye, Mail, NotebookPen, Phone } from "lucide-react";
import { useSelector } from "react-redux";
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
import { formatDate } from "~/utils/formatter";
function StaffCard() {
  const employees = useSelector(state => state.employeeReducer?.employees)


  if (!employees){
    return <>
      CHưa có nhân viên nào
    </>
  }
  return (
    <div className="grid max-[1280px]:grid-cols-2 max-[940px]:grid-cols-1  grid-cols-3 gap-4">
      {employees?.map((employee) => (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex gap-4">
              <Avatar>
                <AvatarFallback className="bg-blue-400 text-[16px]">
                  VH
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{employee?.userName}</CardTitle>
                <CardDescription>{employee.role == "employee" && "Nhân viên"}</CardDescription>
                <Badge className="bg-green-200 text-green-700">
                  {employee.status === "working" && "Đang làm việc" }
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <Phone size={15} />
                <p style={{wordBreak : 'break-word'}}>{employee?.phone}</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <Mail size={15} />
                <p style={{wordBreak : 'break-word'}}>{employee.email}</p>
              </div>
              <div className="flex gap-2 items-center text-gray-600 mb-1.5">
                <CircleDollarSign size={15} />
                <p style={{wordBreak : 'break-word'}}>15.000.000 VNĐ/Tháng</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-between">
            <p>{formatDate(employee?.createdAt)}</p>
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
