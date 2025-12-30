import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import streamifier from "streamifier";
import ApiError from "~/utils/ApiError";
import { env } from '~/config/environment.js'

//Câu hình
const cloudinaryV2 = cloudinary.v2;
cloudinaryV2.config({
  cloud_name: env.CLOUD_NAME,
  api_key: env.API_KEY_CLOUDINARY,
  api_secret: env.API_SECRET_CLOUDINARY,
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