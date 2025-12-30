import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import streamifier from "streamifier";
import ApiError from "~/utils/ApiError";

//Câu hình
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: "dj5i0dfhk",
  api_key: "788447978177883",
  api_secret: "ID9fN6BSTqlwKykUu4b9jZ0E-M4",
});

//upload File
export const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinaryV2.uploader.upload_stream({
        folder : "user_avatar",
        
    },(error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};
export const deleteImage =async (publicId) =>{
    try{
        const result = await cloudinaryV2.uploader.destroy(publicId)
        return result
    }
    catch(e){
        throw new ApiError(StatusCodes.BAD_REQUEST,"Lỗi : " + e)
    }
}