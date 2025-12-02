export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatVND = (value) => {
  if (value == null || value === "") return "0";
  const num = Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (Number.isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(num);
};

export const getLastUpperChar = (str) => {
  if (!str) return "";
  
  const trimmed = str.trim();

  if (trimmed.length === 0) return "";
  const words = str.split(" ")
  // Lấy ký tự cuối cùng
  const lastChar = words[words.length - 1].charAt(0)
  

  // Trả về in hoa
  return lastChar.toUpperCase();
}
