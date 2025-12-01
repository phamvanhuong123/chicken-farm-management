export const validateCreateArea = (req, res, next) => {
  const { name, maxCapacity, staff, status } = req.body;

  if (!name || !maxCapacity || !staff || !status) {
    return res.status(400).json({
      message: "Vui lòng nhập đầy đủ thông tin.",
    });
  }

  if (name.length > 50) {
    return res.status(400).json({
      message: "Tên khu nuôi tối đa 50 ký tự.",
    });
  }

  if (maxCapacity <= 0) {
    return res.status(400).json({
      message: "Sức chứa phải lớn hơn 0.",
    });
  }

  next();
};
