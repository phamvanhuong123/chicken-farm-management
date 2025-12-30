import { StatusCodes } from "http-status-codes"
import multer  from "multer"
import ApiError from "~/utils/ApiError"

export const LIMIT_COMMON_FILE_SIZE = 10485760 // 10MB
export const ALLOW_COMMIN_TYPE_FILE = ["image/jpg", "image/jpeg", "image/png"]
// Kiểm tra loại file nào được chấp nhận

const customFileFilter = (req, file, callback)=> {
    // console.log("Multer File : " , file)
    if (!ALLOW_COMMIN_TYPE_FILE.includes(file.mimetype)){
        return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY,"Kiểu file không hợp lệ"), null)
    }

    // Nếu hợp lệ
    return callback(null, true)
}

//Khởi tạo function upload
const upload = multer({
    limits : {fieldSize : LIMIT_COMMON_FILE_SIZE},
    fileFilter : customFileFilter
})

export const multerUploadMiddleware = {
    upload
}