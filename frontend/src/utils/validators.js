export const FIELD_REQUIRED_MESSAGE = 'Không được để trống'
export const EMAIL_RULE = /^\S+@\S+\.\S+$/
export const EMAIL_RULE_MESSAGE = 'Email không hợp lệ. (example@trungquandev.com)'
export const PHONE_RULE = /^0\d{9}$/
export const PHONE_RULE_MESSAGE = "Số điện thoại không hợp lệ"
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,50}$/
export const PASSWORD_RULE_MESSAGE = 'Không hợp lệ'
export const PASSWORD_CONFIRMATION_MESSAGE = 'Password Confirmation does not match!'



export const LIMIT_COMMON_FILE_SIZE = 10485760 // 10MB
export const ALLOW_COMMIN_TYPE_FILE = ["image/jpg", "image/jpeg", "image/png"]

export const singleFileValidator = (file) => {
    if(!file || !file.name || !file.size || !file.type){
        return "Ảnh không được để trống"
    }
    if (file.size > LIMIT_COMMON_FILE_SIZE) {
        return "Kích thước file không được vượt quá 10MB"
    }
    if (!ALLOW_COMMIN_TYPE_FILE.includes(file.type)){
        return "File không hợp lệ.Chỉ chấp nhận jpg, jpeg và png"
    }
    return null
}