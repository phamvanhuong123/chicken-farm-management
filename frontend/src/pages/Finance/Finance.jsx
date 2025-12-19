import React, { useEffect, useState } from "react";
import HeaderFinance from "./HeaderFinance/HeaderFinance";
import { financeApi } from "../../apis/financeApi";

function Finances() {
  const [finances, setFinances] = useState([]);

  const fetchFinances = async () => {
    const res = await financeApi.getList();
    setFinances(res.data);
  };

  useEffect(() => {
    fetchFinances();
  }, []);

  return (
    <div className="p-6">
      <HeaderFinance refresh={fetchFinances} />

      {/* sau này gắn table + KPI */}
      {/* <pre className="mt-4">{JSON.stringify(finances, null, 2)}</pre> */}
    </div>
  );
}

export default Finances;
