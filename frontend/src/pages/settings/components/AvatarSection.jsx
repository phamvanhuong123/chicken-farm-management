import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { singleFileValidator } from "~/utils/validators";
import { toast } from "react-toastify";
import axiosInstance from "~/apis";

export default function AvatarSection({dataUser}) {
  const [avatarPreview, setAvatarPreview] = useState(
    "https://github.com/shadcn.png"
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading,setLoading] = useState(false)

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file){
      setAvatarFile(null)
      setAvatarPreview("https://github.com/shadcn.png")
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));

    console.log("Avatar selected:", file);
  };

  const handleSubmit =async () => {
    console.log("Submit avatar:", avatarFile);
    const error = singleFileValidator(avatarFile)
    if(error){
      toast.error(error)
      return
    }
    const reqData = new FormData()
    reqData.append("avatar",avatarFile)
    try{
      setLoading(true)
      await axiosInstance.put(`/auth/user/${dataUser._id}`,reqData)
      
      toast.success("Cật nhật Ảnh đại diện thành công")
    }
    catch(error){
      toast.error("Chưa cật nhật được người dùng : " + error )
    }
    finally{
      setLoading(false)
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ảnh đại diện</CardTitle>
      </CardHeader>

      <CardContent className="flex items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div className="space-y-3">
          <Input type="file" accept="image/*" onChange={handleChange} />
          <Button onClick={handleSubmit}>Cập nhật avatar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
