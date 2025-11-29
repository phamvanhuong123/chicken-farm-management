import { GET_DB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export const AREA_COLLECTION = "areas";

export const createArea = async (data) => {
  const db = await GET_DB();
  const result = await db.collection(AREA_COLLECTION).insertOne(data);
  return result;
};

export const getOverview = async () => {
  const db = await GET_DB();
  const col = db.collection(AREA_COLLECTION);

  const totalAreas = await col.countDocuments();
  const activeAreas = await col.countDocuments({ status: "ACTIVE" });
  const emptyAreas = await col.countDocuments({ status: "EMPTY" });
  const maintenanceAreas = await col.countDocuments({ status: "MAINTENANCE" });
  const incidentAreas = await col.countDocuments({ status: "INCIDENT" });

  const employeeDistribution = await col
    .aggregate([
      { $project: { name: 1, staffCount: { $size: "$staff" } } },
      { $sort: { name: 1 } },
    ])
    .toArray();

  return {
    kpis: {
      totalAreas,
      activeAreas,
      emptyAreas,
      maintenanceAreas,
      incidentAreas,
    },
    employeeDistribution,
  };
};

export const listAreas = async (query) => {
  const db = await GET_DB();
  const col = db.collection(AREA_COLLECTION);

  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.search) filter.name = { $regex: query.search, $options: "i" };
  if (query.status && query.status !== "ALL") filter.status = query.status;
  if (query.staffName)
    filter["staff.name"] = { $regex: query.staffName, $options: "i" };

  const sort = {
    [query.sortBy ?? "name"]: query.sortOrder === "desc" ? -1 : 1,
  };

  const data = await col
    .find(filter)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .toArray();
  const total = await col.countDocuments(filter);

  return {
    items: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const exportAreasToExcel = async () => {
  const db = await GET_DB();
  const data = await db.collection(AREA_COLLECTION).find().toArray();
  return data;
};
