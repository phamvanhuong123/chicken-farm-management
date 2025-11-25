import {
  createArea,
  getOverview,
  listAreas,
  exportAreasToExcel,
} from "../services/area.service.js";

export const createAreaController = async (req, res, next) => {
  try {
    const result = await createArea(req.body);
    return res.status(201).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
};

export const getOverviewController = async (req, res, next) => {
  try {
    const data = await getOverview();
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

export const getAreaList = async (req, res, next) => {
  try {
    const data = await listAreas(req.query);
    return res.status(200).json({
      status: "success",
      data: data.items,
      pagination: data.pagination,
    });
  } catch (err) {
    next(err);
  }
};

export const exportAreas = async (req, res, next) => {
  try {
    const data = await exportAreasToExcel();
    return res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};
