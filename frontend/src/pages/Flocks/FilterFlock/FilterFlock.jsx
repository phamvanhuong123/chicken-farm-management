// FilterFlock.js
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

// === NHẬN THÊM PROPS TÌM KIẾM ===
function FilterFlock({
  filterStatus,
  onStatusChange,
  filterSpecies,
  onSpeciesChange,
  allSpecies = [],
  searchTerm, // Nhận giá trị
  onSearchChange, // Nhận hàm xử lý
}) {
  return (
    <>
      <div className="bg-white w-full h-auto min-h-14 rounded-[10px] shadow-sm mt-6 mb-6 flex flex-wrap gap-2 items-center px-3 py-2">
        {/* --- BỘ LỌC TRẠNG THÁI --- */}
        <div className="flex gap-2 items-center">
          <Label>Trạng thái</Label>
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Raising">Đang nuôi</SelectItem>
                <SelectItem value="Sold">Đã bán</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* --- BỘ LỌC GIỐNG GÀ --- */}
        <div className="flex gap-2 items-center">
          <Label>Giống gà</Label>
          <Select value={filterSpecies} onValueChange={onSpeciesChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả</SelectItem>
                {allSpecies.map((species) => (
                  <SelectItem key={species} value={species}>
                    {species}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* === KẾT NỐI INPUT VỚI STATE === */}
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Tìm kiếm theo mã lứa..."
            value={searchTerm} // Giá trị được kiểm soát
            onChange={(e) => onSearchChange(e.target.value)} // Cập nhật state ở component cha
            className="w-[200px]"
          />
        </div>
        {/* ================================ */}
      </div>
    </>
  );
}
export default FilterFlock;