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
      <div className="flex h-screen relative justify-around">
      
        <div className="w-[50%]">
          {isLogin && <LoginForm/>}
          {isRegister && <RegisterForm/>}
        </div>
      </div>
    </>
  );
}
export default Auth;
