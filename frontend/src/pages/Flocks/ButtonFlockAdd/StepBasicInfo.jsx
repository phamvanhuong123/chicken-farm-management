import { useFormContext } from "react-hook-form";

export default function StepBasicInfo() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label>Ngày nhập <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    {...register("importDate", {
                        required: "Ngày nhập bắt buộc",
                        validate: v =>
                            new Date(v) <= new Date() || "Ngày nhập không hợp lệ",
                    })}
                    className="w-full border rounded px-3 py-2"
                />
                <p className="text-red-500 text-sm">{errors.importDate?.message}</p>
            </div>

            <div>
                <label>Nhà cung cấp <span className="text-red-500">*</span></label>
                <select
                    {...register("supplierName", { required: "Chọn nhà cung cấp" })}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="">Chọn nhà cung cấp</option>
                    <option value="Trung tâm Gia cầm Thụy Phương">Trung tâm Gia cầm Thụy Phương</option>
                    <option value="Trại gà Bình Định">Trại gà Bình Định</option>
                    <option value="HTX Gà Hòa Bình">HTX Gà Hòa Bình</option>
                    <option value="Trại Giống Thu Hà">Trại Giống Thu Hà</option>
                    <option value="Trung tâm Nghiên cứu Gia cầm Tam Đảo">Trung tâm Nghiên cứu Gia cầm Tam Đảo</option>
                </select>
                <p className="text-red-500 text-sm">{errors.supplierName?.message}</p>
            </div>

            <div>
                <label>Giống gà <span className="text-red-500">*</span></label>
                <select
                    {...register("speciesId", { required: "Chọn giống gà" })}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="">Chọn giống</option>
                    <option value="Gà ta">Gà ta</option>
                    <option value="Gà công nghiệp">Gà công nghiệp</option>
                    <option value="Gà thả vườn">Gà thả vườn</option>
                </select>
                <p className="text-red-500 text-sm">{errors.speciesId?.message}</p>
            </div>

            <div>
                <label>Số lượng <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    {...register("initialCount", {
                        required: "Số lượng bắt buộc",
                        min: { value: 1, message: "Số lượng phải > 0" },
                    })}
                    className="w-full border rounded px-3 py-2"
                />
                <p className="text-red-500 text-sm">{errors.initialCount?.message}</p>
            </div>

            <div className="col-span-2">
                <label>Trọng lượng ban đầu (kg) <span className="text-red-500">*</span></label>
                <input
                    type="number"
                    step="0.01"
                    {...register("avgWeight", {
                        required: "Nhập trọng lượng",
                        min: { value: 0.01, message: "Trọng lượng phải > 0" },
                    })}
                    className="w-full border rounded px-3 py-2"
                />
                <p className="text-red-500 text-sm">{errors.avgWeight?.message}</p>
            </div>
        </div>
    );
}
