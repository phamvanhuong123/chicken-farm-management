import { useSelector } from "react-redux";
import { getUserState } from "~/slices/authSlice";

export const useIsEmployer = () => {
  const user = useSelector((state) => getUserState(state));
  return user?.roleId === "employer"
};