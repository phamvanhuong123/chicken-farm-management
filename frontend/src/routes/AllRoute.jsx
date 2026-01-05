import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import LayoutDefault from "~/layout/LayoutDefault";
import Areas from "~/pages/Areas/Areas";
import Auth from "~/pages/Auth/Auth";
import Dashboard from "~/pages/Dashboard/Dashboard";
import Finance from "~/pages/Finance/Finance";
import Flocks from "~/pages/Flocks/Flocks";
import FlockTransactions from "~/pages/FlockTransactions/FlockTransactions";
import ForgotPasswordPage from "~/pages/ForgetPassword/ForgotPasswordPage";
import Inventory from "~/pages/Inventory/Inventory";
import Journal from "~/pages/Journal/Journal";
import Settings from "~/pages/settings/Settings";
import Staff from "~/pages/Staff/Staff";
import { getUserState } from "~/slices/authSlice";

const PriveRoutes = () => {
  const user = useSelector((state) => getUserState(state));
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

// Ngăn chặn khi đã đăng nhập lại vào trang login
const UnAuthorizeRoute = () => {
  const location = useLocation();
  const user = useSelector((state) => getUserState(state));
  if (user) {
    return (
      <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />
    );
  }
  return <Outlet />;
};
function AllRoute() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace={true} />} />
      <Route element={<PriveRoutes />}>
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<LayoutDefault />}>
          <Route index element={<Dashboard />} />
          <Route path="flocks" element={<Flocks />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="journal" element={<Journal />} />
          <Route path="flock-transactions" element={<FlockTransactions />} />
          <Route path="areas" element={<Areas />} />
          <Route path="staff" element={<Staff />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Route>
      <Route element={<UnAuthorizeRoute />}>
        <Route path="/login" element={<Auth />} />
      </Route>
      <Route path="/register" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    </Routes>
  );
}
export default AllRoute;
