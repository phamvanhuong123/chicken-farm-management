import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Plus, Search, RefreshCw, Loader2 } from "lucide-react";
import { useSelector } from 'react-redux';
import { getUserState } from '~/slices/authSlice';

// Import components
import { JournalTable } from './JournalTable/JournalTable';
import { JournalModal } from './JournalModal/JournalModal';

// CẤU HÌNH API URL
const LOG_API_URL = "http://localhost:8071/v1/logs";
const AREA_API_URL = "http://localhost:8071/v1/areas";

const Journal = () => {
  const user = useSelector(state => getUserState(state));
  
  // State dữ liệu
  const [entries, setEntries] = useState([]); // Dữ liệu gốc từ API
  const [areas, setAreas] = useState([]);
  
  // State Loading & Modal
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Filter states
  const [filterAreaId, setFilterAreaId] = useState('ALL'); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. LẤY DANH SÁCH KHU VỰC ---
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get(AREA_API_URL);
        if (response.data && response.data.data) {
          setAreas(response.data.data);
        }
      } catch (error) {
        console.error("Lỗi tải khu vực:", error);
      }
    };
    fetchAreas();
  }, []);

  // --- 2. LẤY DANH SÁCH NHẬT KÝ ---
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (filterAreaId !== 'ALL') {
            params.areaId = filterAreaId;
        }

        const response = await axios.get(LOG_API_URL, { params });
        const backendData = response.data;
        
        if (backendData && backendData.data) {
          setEntries(backendData.data);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error("Lỗi tải nhật ký:", error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [filterAreaId]);

  // --- 3. LOGIC TÌM KIẾM (Mới thêm) ---
  // Lọc dữ liệu dựa trên searchTerm mỗi khi entries hoặc searchTerm thay đổi
  const filteredEntries = useMemo(() => {
    // Nếu không có từ khóa tìm kiếm, trả về toàn bộ danh sách
    if (!searchTerm.trim()) return entries;

    const lowerTerm = searchTerm.toLowerCase();
    
    return entries.filter(item => {
      // Tìm trong Ghi chú (Note)
      const noteMatch = (item.note?.toLowerCase() || '').includes(lowerTerm);
      
      // (Tùy chọn) Tìm thêm trong tên người ghi nếu muốn tiện hơn
      const userMatch = (item.userName?.toLowerCase() || '').includes(lowerTerm);

      return noteMatch || userMatch;
    });
  }, [entries, searchTerm]);

  // --- 4. ACTIONS ---
  const handleAddNew = () => {
    setEditingEntry(null); 
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingEntry(item);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        userId: user?._id || user?.id || "unknown_user_id", 
      };

      if (editingEntry) {
        // Cập nhật
        const recordId = editingEntry._id || editingEntry.id;
        const response = await axios.put(`${LOG_API_URL}/${recordId}`, payload);
        const updatedFields = response.data.data;
        
        setEntries(prev => prev.map(item => 
          (item._id === recordId || item.id === recordId) 
            ? { ...item, ...updatedFields }
            : item
        ));

      } else {
        // Thêm mới
        const response = await axios.post(LOG_API_URL, payload);
        const newItem = response.data.data;

        if (filterAreaId === 'ALL' || filterAreaId === newItem.areaId) {
             setEntries(prev => [newItem, ...prev]);
        }
      }
      
      setIsModalOpen(false);
      setEditingEntry(null);

    } catch (error) {
      console.error("Lỗi lưu:", error);
      const serverMessage = error.response?.data?.message || "Có lỗi xảy ra";
      alert(`Lỗi: ${serverMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${LOG_API_URL}/${id}`);
      setEntries(prev => prev.filter(item => {
          const itemId = item._id || item.id;
          return itemId !== id;
      }));
    } catch (error) {
      console.error("Lỗi xóa:", error);
      const serverMessage = error.response?.data?.message || "Không thể xóa bản ghi này.";
      alert(serverMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Nhật ký chăn nuôi</h1>
            <p className="text-gray-500 mt-1">Quản lý và theo dõi hoạt động hàng ngày.</p>
          </div>
          <Button onClick={handleAddNew} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4 " /> Thêm nhật ký
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            {/* Search Input */}
            <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Tìm kiếm</label>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Tìm theo ghi chú..." 
                      className="pl-9 bg-gray-50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Area Filter */}
            <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase">Khu vực</label>
                <Select value={filterAreaId} onValueChange={setFilterAreaId}>
                    <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tất cả khu</SelectItem>
                        {areas.map((area) => (
                            <SelectItem key={area._id} value={area._id}>
                                {area.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-4 md:text-right">
                <Button variant="outline" onClick={() => { setFilterAreaId('ALL'); setSearchTerm(''); }}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" /> Xóa bộ lọc
                </Button>
            </div>
        </div>

        {/* Table - Sử dụng filteredEntries thay vì entries */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl border">
             <div className="flex flex-col items-center gap-2 text-gray-500">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <p>Đang tải dữ liệu...</p>
             </div>
          </div>
        ) : (
          <JournalTable 
            data={filteredEntries} // <--- QUAN TRỌNG: Truyền mảng đã lọc vào đây
            onEdit={handleEditClick} 
            onDelete={handleDelete}
          />
        )}

        {/* Modal */}
        <JournalModal 
            open={isModalOpen} 
            onOpenChange={setIsModalOpen}
            onSubmit={handleSave}
            initialData={editingEntry}
            areas={areas}
        />

      </div>
      
      {/* Loading Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                <span className="font-medium text-gray-700">Đang lưu dữ liệu...</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default Journal;