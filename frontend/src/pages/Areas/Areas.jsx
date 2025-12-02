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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOverview();
  }, []);

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
      />
    </div>
  );
}

export default Areas;
