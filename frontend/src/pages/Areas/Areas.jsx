import React, { useEffect, useState } from "react";
import HeaderArea from "./HeaderArea/HeaderArea.jsx";
import StatisticalArea from "./StatisticalArea/StatisticalArea.jsx";
import FilterArea from "./FilterArea/FilterArea.jsx";
import TableArea from "./TableArea/TableArea.jsx";
import { getAreaList, getAreaOverview } from "../../services/areaService";

function Areas() {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    staffName: "",
    page: 1,
    limit: 10,
  });

  const [areas, setAreas] = useState([]);
  const [staffList, setStaffList] = useState([]); // danh sách nhân viên
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load overview 1 lần
  useEffect(() => {
    fetchOverview();
  }, []);

  // Load danh sách khu khi filter thay đổi
  useEffect(() => {
    fetchAreas();
  }, [filters]);

  const fetchOverview = async () => {
    const res = await getAreaOverview();
    setOverview(res.data);
  };

  const fetchAreas = async () => {
    setLoading(true);
    const res = await getAreaList(filters);
    setAreas(res.data);
    setPagination(res.pagination);
    setLoading(false);

    // ⭐ GOM danh sách nhân viên từ tất cả khu
    const staffSet = new Map();

    res.data.forEach((area) => {
      area.staff.forEach((st) => {
        // BE KHÔNG TRẢ id → FE phải tự tạo key duy nhất
        const key = `${st.name}-${st.avatarUrl}`;

        if (!staffSet.has(key)) {
          staffSet.set(key, {
            id: key, // tạo ID tạm cho checkbox
            name: st.name,
            avatarUrl: st.avatarUrl,
          });
        }
      });
    });

    setStaffList(Array.from(staffSet.values()));
  };

  return (
    <div className="p-6">
      <HeaderArea refresh={fetchAreas} />

      <StatisticalArea overview={overview} />

      <FilterArea filters={filters} setFilters={setFilters} />

      <TableArea
        loading={loading}
        data={areas}
        pagination={pagination}
        setFilters={setFilters}
        filters={filters}
        staffList={staffList} // truyền đầy đủ danh sách nhân viên
      />
    </div>
  );
}

export default Areas;
