import ExcelJS from "exceljs";
import { areaModel, AREA_STATUS } from "../models/area.model.js";
import { ObjectId } from "mongodb";
import { GET_DB } from "../config/mongodb.js";

// Build query filter cho list
const buildFilter = ({ search, status, staffName }) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (status && status !== "ALL") {
    filter.status = status;
  }

  if (staffName) {
    filter["staff.name"] = { $regex: staffName, $options: "i" };
  }

  return filter;
};

const createArea = async (data) => {
  try {
    // 🔍 Kiểm tra tên khu đã tồn tại
    const exists = await areaModel.find({ name: data.name.trim() });

    if (exists.length > 0) {
      const error = new Error("Tên khu nuôi đã tồn tại.");
      error.statusCode = 400;
      throw error;
    }

    const result = await areaModel.create(data);
    return result;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message =
        "Không thể thêm khu nuôi, vui lòng thử lại. " + (error.message || "");
    }
    throw error;
  }
};

const getOverview = async () => {
  try {
    const [
      totalAreas,
      activeAreas,
      emptyAreas,
      maintenanceAreas,
      incidentAreas,
      employeeDistribution,
    ] = await Promise.all([
      areaModel.count({}),
      areaModel.count({ status: AREA_STATUS.ACTIVE }),
      areaModel.count({ status: AREA_STATUS.EMPTY }),
      areaModel.count({ status: AREA_STATUS.MAINTENANCE }),
      areaModel.count({ status: AREA_STATUS.INCIDENT }),
      areaModel.aggregate([
        { $project: { name: 1, staffCount: { $size: "$staff" } } },
        { $sort: { name: 1 } },
      ]),
    ]);

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
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể lấy dữ liệu tổng quan khu nuôi.";
    }
    throw error;
  }
};

const listAreas = async (options) => {
  try {
    const {
      search,
      status,
      staffName,
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = options;

    const filter = buildFilter({ search, status, staffName });
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      areaModel.find(filter, { sort, skip, limit: limitNum }),
      areaModel.count(filter),
    ]);

    return {
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể lấy danh sách khu nuôi.";
    }
    throw error;
  }
};

const exportAreasToExcel = async (options) => {
  try {
    const { items } = await listAreas({
      ...options,
      page: 1,
      limit: 1_000_000,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Areas");

    sheet.columns = [
      { header: "Tên khu nuôi", key: "name", width: 30 },
      { header: "Sức chứa (đang/tối đa)", key: "capacity", width: 25 },
      { header: "Nhân viên phụ trách", key: "staff", width: 40 },
      { header: "Trạng thái", key: "status", width: 20 },
      { header: "Ghi chú", key: "note", width: 30 },
    ];

    items.forEach((area) => {
      sheet.addRow({
        name: area.name,
        capacity: `${area.currentCapacity}/${area.maxCapacity}`,
        staff: (area.staff || []).map((s) => s.name).join(", "),
        status: area.status,
        note: area.note || "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể xuất Excel danh sách khu nuôi.";
    }
    throw error;
  }
};
// Cập nhật khu nuôi
const updateArea = async (id, data) => {
  try {
    const result = await areaModel.update(id, data);

    if (!result || result.matchedCount === 0) {
      const error = new Error("Không tìm thấy khu nuôi.");
      error.statusCode = 404;
      throw error;
    }

    return result;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Không thể cập nhật khu nuôi, vui lòng thử lại.";
    }
    throw error;
  }
};
//  TEAM-136: Xóa khu nuôi
const deleteArea = async (id) => {
  try {
    const areas = await areaModel.find({ _id: new ObjectId(id) });

    if (!areas || areas.length === 0) {
      return {
        status: "error",
        message: "Khu nuôi không tồn tại.",
      };
    }

    const area = areas[0];

    //  Không cho xóa nếu đang có đàn gà
    if (area.currentCapacity > 0) {
      return {
        status: "error",
        message: "Không thể xóa khu đang có đàn gà hoạt động.",
      };
    }

    await GET_DB()
      .collection(areaModel.AREA_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) });

    return {
      status: "success",
      message: "Xóa thành công.",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Không thể xóa khu nuôi, vui lòng thử lại.",
    };
  }
};
// Thêm hàm mới để lấy thông tin capacity
const getAreaCapacityInfo = async (areaName) => {
  try {
    const areas = await areaModel.find({ name: areaName });
    if (!areas || areas.length === 0) {
      return null;
    }

    const area = areas[0];

    // Tính số lượng hiện tại từ imports
    const imports = await GET_DB()
      .collection('imports')
      .find({
        barn: areaName,
        status: "Đang nuôi"
      })
      .toArray();

    const currentCapacity = imports.reduce((sum, imp) => sum + (imp.quantity || 0), 0);

    return {
      ...area,
      currentCapacity,
      remainingCapacity: area.maxCapacity - currentCapacity
    };
  } catch (error) {
    console.error("Error getting area capacity info:", error);
    throw error;
  }
};

export const areaService = {
  createArea,
  getOverview,
  listAreas,
  exportAreasToExcel,
  updateArea,
  deleteArea,
  getAreaCapacityInfo,
};
