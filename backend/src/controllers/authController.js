import { StatusCodes } from "http-status-codes"
import { userService } from "~/services/user.service"
import ApiError from "~/utils/ApiError"

export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body)
    res.status(201).json({
      message: "Tạo tài khoản thành công, vui lòng xác thực OTP",
      data: user
    })
  } catch (error) {
    next(error)
  }
}

export const verifyOTP = async (req, res, next) => {
  try {
    await userService.verifyOTP(req.body)
    res.status(200).json({ message: "Xác thực thành công!" })
  } catch (error) {
    next(error)
  }
}

export const resendOTP = async (req, res, next) => {
  try {
    await userService.resendOTP(req.body.email)
    res.status(200).json({ message: "Đã gửi lại OTP, kiểm tra email" })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    res.status(200).json({
      message: "Đăng nhập thành công",
      ...result
    })
  } catch (error) {
    next(error)
  }
}
export const findUserByParentId = async (req, res, next) => {
  try{
    const parentId = req.params.parentId
    if (!parentId) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"Thiếu parentId")
    }
    const result = await userService.findUserByParentId(parentId)

    res.status(StatusCodes.ACCEPTED).json({
      statusCode  : StatusCodes.ACCEPTED,
      message : "Thành công",
      data : result
    })
  }
  catch(error) {
    next(error)
  }
}

export const addEmployee = async (req, res, next)=>{
  try{
    const parentId = req.params.parentId
    const result = await userService.addEmployee(parentId,req.body)
    res.status(StatusCodes.CREATED).json({
      statusCode  : StatusCodes.CREATED,
      message : "Thành công",
      data : result
    })
  }
  catch(error){
    next(error)    
  }
}

export const getAllUser = async (req, res, next) =>{
  try{
    const result = await userService.getAllUser()
    res.status(StatusCodes.ACCEPTED).json({
      statusCode : StatusCodes.ACCEPTED,
      message : "Thành công",
      data : result

    })
  }
  catch(error){
    next(error)
  }
}