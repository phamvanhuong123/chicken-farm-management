import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const PeriodFilter = ({ selectedPeriod, onPeriodChange, loading = false }) => {
    const periods = [
        { value: '24h', label: '24 giờ' },
        { value: '7d', label: '7 ngày' },
        { value: '30d', label: '30 ngày' },
        { value: '90d', label: '90 ngày' },
        { value: 'all', label: 'Tất cả' }
    ];

    return (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
            <div className="flex items-center gap-2 px-3">
                <FaCalendarAlt className="text-gray-500" />
                <span className="text-sm text-gray-600 whitespace-nowrap">Khoảng thời gian:</span>
            </div>
            <div className="flex bg-gray-100 rounded-md p-1">
                {periods.map((period) => (
                    <button
                        key={period.value}
                        onClick={() => !loading && onPeriodChange(period.value)}
                        disabled={loading}
                        className={`px-3 py-1.5 text-sm rounded transition-colors ${selectedPeriod === period.value
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {period.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PeriodFilter;