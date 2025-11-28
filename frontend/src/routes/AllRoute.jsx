import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import { Navigate, Outlet, Route, Routes } from "react-router";
import LayoutDefault from "~/layout/LayoutDefault";
import Areas from "~/pages/Areas/Areas";
import Auth from "~/pages/Auth/Auth";
import Dashboard from "~/pages/Dashboard/Dashboard";
import Flocks from "~/pages/Flocks/Flocks";
import FlockTransactions from "~/pages/FlockTransactions/FlockTransactions";
import Inventory from "~/pages/Inventory/Inventory";
import Journal from "~/pages/Journal/Journal";
import Staff from "~/pages/Staff/Staff";
import { getUserState } from "~/slices/authSlice";

// Tạm thời làm thế này
const PriveRoutes = () => {
  const user = useSelector((state) => getUserState(state));
  if (!user) return <Navigate to={"/login"} replace={true} />;
  return <Outlet />;
};

// Ngăn chặn khi đã đăng nhập lại vào trang login
const UnAuthorizeRoute = () => {
  const user = useSelector((state) => getUserState(state));
  if (user) return <Navigate to={"/dashboard/flocks"} replace={true} />;
  return <Outlet />;
};
function AllRoute() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard/flocks" replace={true} />}
      />
      <Route element={<PriveRoutes />}>
        <Route path="/dashboard" element={<LayoutDefault />}>
          <Route index element={<Dashboard />} />
          <Route path="flocks" element={<Flocks />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="journal" element={<Journal />} />
          <Route path="flock-transactions" element={<FlockTransactions />} />
          <Route path="areas" element={<Areas />} />
          <Route path="staff" element={<Staff />} />
        </Route>
      </Route>
     <Route element={<UnAuthorizeRoute/>}>
       <Route path="/login" element={<Auth />} />
     </Route>
      <Route path="/register" element={<Auth />} />
    </Routes>
  );
}
export default AllRoute;
