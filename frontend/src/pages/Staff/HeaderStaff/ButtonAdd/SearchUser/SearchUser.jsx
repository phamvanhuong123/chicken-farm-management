import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useRef, useState } from "react";
import { X } from "lucide-react";
import FieldErrorAlert from "~/components/FieldErrorAlert";

function SearchUser({ setValueForm, unregisterForm,registerForm, errors, clearErrors }) {
  const users = [
    {
      id: "4",
      userName: "Phạm Văn Hương",
      phone: "0327707140",
      email: "phamvanhong@gmail.com",
    },
    {
      id: "3",
      userName: "Nguyễn Thị Minh Anh",
      phone: "0985123456",
      email: "minhanhnguyen@gmail.com",
    },
    {
      id: "2",
      userName: "Trần Quốc Bảo",
      phone: "0912345678",
      email: "baotranqb@gmail.com",
    },
    {
      id: "1",
      userName: "Lê Hoàng Phúc",
      phone: "0938765432",
      email: "phuclehoang@gmail.com",
    },
    {
      id: "8",
      userName: "Hoàng Thị Thu Trang",
      phone: "0974556677",
      email: "tranghoangthu@gmail.com",
    },
    {
      userName: "Đỗ Minh Tuấn",
      phone: "0903111222",
      email: "tuan.do.minh@gmail.com",
    },
  ];
  const userRef = useRef(users);


  const searchTimeOut = useRef(null);
  const [dataUsers, setDataUsers] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [dataAddEmployee, setDataAddEmployee] = useState(null);

  // Khi thay đổi giá trị trong input
  const onChangeValue = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    if (value === "") {
      setDataUsers(null);
      return;
    }
    if (searchTimeOut.current) clearTimeout(searchTimeOut.current);
    searchTimeOut.current = setTimeout(() => {
      const newData = userRef.current.filter((user) => {
        if (
          user.email.toLowerCase().includes(value.trim()) ||
          user.userName.toLowerCase().includes(value.trim()) ||
          user.phone.toLowerCase().includes(value.trim())
        )
          return user;
      });

      setDataUsers(newData);
    }, 500);
  };

  const handleAddEmployee = (idEmployee) => {
    setSearchValue("");
    setDataUsers(null);
    setDataAddEmployee(userRef.current.find((user) => user.id === idEmployee));
    setValueForm("idEmployee",idEmployee)
    if(errors.idEmployee){
      clearErrors("idEmployee")
    }
  };


  const handleClose = ()=>{
    setDataAddEmployee(null)
    unregisterForm("idEmployee")
    setValueForm("idEmployee","")

  }
  return (
    <div className="mb-3.5">
      <input type="hidden" name="" id="" {...registerForm("idEmployee", { required: "Vui lòng chọn người dùng" })} />
      {dataAddEmployee ? (
        <Item
          className={`bg-green-200 border border-green-500 relative mb-5`}
          key={dataAddEmployee.id}
        >
          <ItemContent>
            <ItemTitle className={`font-bold text-black`}>
              {dataAddEmployee.userName}
            </ItemTitle>
            <ItemDescription className={` text-black`}>
              Số điện thoại : {dataAddEmployee.phone}
            </ItemDescription>
            <ItemDescription className={` text-black`}>
              Email : {dataAddEmployee.email}
            </ItemDescription>
          </ItemContent>
          <X onClick={handleClose} className="absolute right-1.5 top-1.5 cursor-pointer" />
        </Item>
      ) : (
        <div >
          <Label className="mb-2.5">
            Tìm kiếm theo tên, email, số điện thoại{" "}
            <span className="text-red-600">*</span>
          </Label>
          <Input
            value={searchValue}
            onChange={onChangeValue}
            type="text"
            placeholder="Tìm"
            className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]"
          />
          <div
            className={`w-full bg-white ${
              searchValue && "border"
            } z-10 max-h-[300px] overflow-auto mt-3 rounded-[10px]`}
          >
            {searchValue &&
              dataUsers?.map((user) => (
                <Item key={user.id} className="hover:bg-gray-200">
                  <ItemContent>
                    <ItemTitle>{user.userName}</ItemTitle>
                    <ItemDescription>
                      Số điện thoại : {user.phone}
                    </ItemDescription>
                    <ItemDescription>Email : {user.email}</ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      id={user.id}
                      onClick={() => {
                        handleAddEmployee(user.id);
                      }}
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                    >
                      Thêm
                    </Button>
                  </ItemActions>
                </Item>
              ))}

            {dataUsers?.length === 0 && (
              <Item>
                <ItemContent>
                  <ItemDescription>Không tìm thấy</ItemDescription>
                </ItemContent>
              </Item>
            )}
          </div>
        </div>
      )}
       <FieldErrorAlert errors={errors} fieldName={"idEmployee"} />

    </div>
  );
}
export default SearchUser;
