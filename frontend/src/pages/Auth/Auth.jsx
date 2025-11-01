import {useLocation} from 'react-router'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

function Auth() {
  const location = useLocation()
  console.log(location)
  const isLogin = location.pathname === '/login'
  const isRegister = location.pathname === '/register'

  
  return (
    <>
      <div className="flex h-screen relative">
        <div className="relative w-[40%] max-[620px]:hidden">
          <img
            src="https://farmgo.vn/wp-content/uploads/2025/08/phan-mem-nuoi-ga-thit.jpg"
            alt="s"
            className=""
          />
          <div className="absolute top-0 w-full h-full bg-black opacity-30"></div>
        </div>
        <div className="flex-1">
          {isLogin && <LoginForm/>}
          {isRegister && <RegisterForm/>}
        </div>
      </div>
    </>
  );
}
export default Auth;
