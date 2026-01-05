import AvatarSection from "./components/AvatarSection";
import ProfileForm from "./components/ProfileForm";
import PasswordForm from "./components/PasswordForm";
import { Separator } from "~/components/ui/separator";
import { useSelector } from "react-redux";
import { getUserState } from "~/slices/authSlice";
import { useEffect, useState } from "react";
import axiosInstance from "~/apis";

export default function SettingPage() {
  const user = useSelector(state => getUserState(state))
  const [dataUser,setDataUser] = useState(null)

  useEffect(()=> {
    const fetchApiUser = async() => {
      const res = await axiosInstance.get(`/auth/user/${user.id}`)
      setDataUser(res.data?.data)
    }
    fetchApiUser()
  },[])
  console.log(dataUser)
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>

      <AvatarSection dataUser={dataUser}/>
      <ProfileForm dataUser={dataUser} />

      <Separator />

      <PasswordForm dataUser={dataUser} />
    </div>
  );
}