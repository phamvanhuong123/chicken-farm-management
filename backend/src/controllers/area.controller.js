import { areaService } from "../services/area.service.js";

// Tạo mới khu nuôi
export const createArea = async (req, res, next) => {
  try {
    const { name, maxCapacity, staff, status, note } = req.body;

    // Validate các field bắt buộc
    if (!name || !maxCapacity || !status) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Tên khu nuôi không hợp lệ.",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        status: "error",
        message: "Tên khu nuôi không được vượt quá 50 ký tự.",
      });
    }

    if (Number(maxCapacity) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Sức chứa phải lớn hơn 0.",
      });
    }
    // 🔍 KIỂM TRA TÊN KHU ĐÃ TỒN TẠI
    const existing = await areaService.listAreas({
      search: name.trim(),
      limit: 999999,
    });

    if (
      existing.items.some(
        (a) => a.name.trim().toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: "Tên khu nuôi đã tồn tại.",
      });
    }

    const payload = {
      name: name.trim(),
      maxCapacity: Number(maxCapacity),
      staff: Array.isArray(staff) ? staff : [],
      status,
      note: note || "",
    };

    const result = await areaService.createArea(payload);

    return res.status(201).json({
      status: "success",
      message: "Thêm khu nuôi thành công.",
      data: result,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Không thể thêm khu nuôi, vui lòng thử lại.",
    });
  }
};

// Lấy 5 KPI + biểu đồ nhân viên
export const getOverviewController = async (req, res, next) => {
  try {
    const data = await areaService.getOverview();
    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Không thể lấy dữ liệu tổng quan.",
    });
  }
};

// Lấy danh sách + filter + paging + sort
export const getAreaList = async (req, res, next) => {
  try {
    const result = await areaService.listAreas(req.query);

    return res.status(200).json({
      status: "success",
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Không thể lấy danh sách khu nuôi.",
    });
  }
};

// Xuất Excel
export const exportAreas = async (req, res, next) => {
  try {
    const buffer = await areaService.exportAreasToExcel(req.query);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="areas.xlsx"');

    return res.send(buffer);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message: error.message || "Không thể xuất Excel danh sách khu nuôi.",
    });
  }
};

export const updateArea = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, maxCapacity, staff, status, note } = req.body;

    // Không được để trống Tên khu và Sức chứa tối đa
    if (!name || !maxCapacity) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng nhập đầy đủ thông tin.",
      });
    }

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Tên khu nuôi không hợp lệ.",
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({
        status: "error",
        message: "Tên khu nuôi không được vượt quá 50 ký tự.",
      });
    }

    if (Number(maxCapacity) <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Sức chứa phải lớn hơn 0.",
      });
    }

    const payload = {
      name: name.trim(),
      maxCapacity: Number(maxCapacity),
      staff: Array.isArray(staff) ? staff : [],
      status,
      note: note || "",
    };

    await areaService.updateArea(id, payload);

    return res.status(200).json({
      status: "success",
      message: "Cập nhật thành công.",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      status: "error",
      message:
        error.message || "Không thể cập nhật khu nuôi, vui lòng thử lại.",
    });
  }
};
//  TEAM-136: Xóa khu nuôi
export const deleteArea = async (req, res, next) => {
  try {
    const id = req.params.id;

    const result = await areaService.deleteArea(id);

    if (result.status === "error") {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Không thể xóa khu nuôi, vui lòng thử lại.",
    });
  }
};
