import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const KPICard = ({
    title,
    value,
    change,
    unit,
    icon,
    color = 'gray',
    status = 'neutral',
    description,
    loading = false,
    iconBgColor = 'bg-gray-50',
    note,
    isCurrency = false
}) => {
    const getStatusInfo = () => {
        // Ưu tiên color từ props (đã được xử lý trong Dashboard)
        const getColorClass = () => {
            switch (color) {
                case 'green': return 'text-green-600';
                case 'red': return 'text-red-600';
                case 'orange': return 'text-orange-600';
                case 'gray': return 'text-gray-500';
                default: return 'text-gray-500';
            }
        };

        const colorClass = getColorClass();

        if (status === 'up') {
            return {
                icon: <FaArrowUp className="text-xs" />,
                color: colorClass,
                text: change > 0 ? `+${change}%` : `${change}%`
            };
        } else if (status === 'down') {
            return {
                icon: <FaArrowDown className="text-xs" />,
                color: colorClass,
                text: change < 0 ? `${change}%` : `+${change}%`
            };
        }
        return {
            icon: <FaMinus className="text-xs" />,
            color: colorClass,
            text: change !== undefined ? `${change}%` : '0%'
        };
    };

    const statusInfo = getStatusInfo();

    const formatValue = (val) => {
        // Xử lý tiền tệ - cả VND và isCurrency
        if (isCurrency || unit === 'VND' || unit === '₫') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: val >= 1000000 ? 'compact' : 'standard',
                compactDisplay: 'short',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(val);
        }

        // Format số thập phân cho trọng lượng
        if (unit === 'kg/con') {
            return val.toFixed(2);
        }

        // Format số lớn
        if (val >= 1000000) {
            return new Intl.NumberFormat('vi-VN', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1
            }).format(val);
        }

        if (val >= 1000) {
            return new Intl.NumberFormat('vi-VN').format(val);
        }

        return val;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-lg ${iconBgColor}`}></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-100 h-full">
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgColor}`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide truncate">
                        {title}
                    </h3>
                    {note && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{note}</p>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
                        {formatValue(value)}
                    </h2>
                    {unit && !isCurrency && unit !== 'VND' && unit !== '₫' && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">{unit}</span>
                    )}
                </div>

                <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="text-xs font-medium">{statusInfo.text}</span>
                </div>

                {description && (
                    <p className="text-xs text-gray-400 pt-1 border-t border-gray-100 truncate">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default KPICard;