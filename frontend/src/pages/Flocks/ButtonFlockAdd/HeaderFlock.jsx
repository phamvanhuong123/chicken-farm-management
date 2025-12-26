import { useState } from "react";
import FlockCreateModal from "./FlockCreateModal";

export default function HeaderFlock({ addFlockData }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Danh sách đàn gà</h2>

                <button
                    onClick={() => setOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Thêm đàn mới
                </button>
            </div>

            {open && (
                <FlockCreateModal
                    onClose={() => setOpen(false)}
                    addFlockData={addFlockData}
                />
            )}
        </>
    );
}
