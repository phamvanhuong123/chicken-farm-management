import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

const PeriodFilter = ({ selectedPeriod, onPeriodChange, loading = false }) => {
    const periods = [
        { value: '7d', label: '7 ngày' },
        { value: '30d', label: '30 ngày' },
        { value: '90d', label: '90 ngày' },
        { value: 'all', label: 'Tất cả' }
    ];

    return (
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
            <div className="flex items-center gap-1 px-2">
                <FaCalendarAlt className="text-gray-500 text-sm" />
                <span className="text-xs text-gray-600 whitespace-nowrap">Thời gian:</span>
            </div>
            <div className="flex bg-gray-100 rounded-md p-1">
                {periods.map((period) => (
                    <button
                        key={period.value}
                        onClick={() => !loading && onPeriodChange(period.value)}
                        disabled={loading}
                        className={`px-2 py-1 text-xs rounded transition-colors ${selectedPeriod === period.value
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