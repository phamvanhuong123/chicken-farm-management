import { CircleDollarSign, Mail, Phone } from "lucide-react";
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
import { formatDate, formatVND, getLastUpperChar } from "~/utils/formatter";
import EditButton from "./EditButton";
import DeleteButton from "./DeleteButton";
function StaffCard() {
  const employees = useSelector(state => state.employeeReducer?.employees)
  const colorStatus = {
    working : "bg-green-200 text-green-700",
    onLeave : "bg-red-200 text-red-700"
  }

  if ([...employees].length === 0){
    return <>
      Chưa có nhân viên nào
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
                  {getLastUpperChar(employee?.username)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{employee?.username}</CardTitle>
                <CardDescription>{employee.role == "employee" && "Nhân viên"}</CardDescription>
                <Badge className={colorStatus[employee.status]}>
                  {employee.status === "working" && "Đang làm việc" }
                  {employee.status === "onLeave" && "Nghĩ phép" }
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
                <p style={{wordBreak : 'break-word'}}>{formatVND(employee.salary)}Đ</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-between">
            <p>{formatDate(employee?.createdAt)}</p>
            <div className="flex gap-1">
              <EditButton employee={employee}/>
              <DeleteButton/>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
export default StaffCard;
