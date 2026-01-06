let apiRoot = ''
if(process.env.BUILD_MODE ==="dev"){
    apiRoot = "http://localhost:8071/v1"
}
if(process.env.BUILD_MODE ==="production"){
    apiRoot = "https://chicken-farm-management.onrender.com/v1"
}
export const API_ROOT = apiRoot