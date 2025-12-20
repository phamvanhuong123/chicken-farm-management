import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const KPICard = ({
    title,
    value,
    change,
    unit,
    icon,
    color = 'default',
    status = 'neutral',
    description,
    loading = false,
    iconBgColor = 'bg-gray-50',
    note,
    isCurrency = false
}) => {
    const getStatusInfo = () => {
        if (status === 'up') {
            return {
                icon: <FaArrowUp className="text-sm" />,
                color: color === 'green' ? 'text-green-600' : 'text-red-600',
                text: change > 0 ? `+${change}%` : `${change}%`
            };
        } else if (status === 'down') {
            return {
                icon: <FaArrowDown className="text-sm" />,
                color: color === 'green' ? 'text-green-600' : 'text-red-600',
                text: change < 0 ? `${change}%` : `+${change}%`
            };
        }
        return {
            icon: <FaMinus className="text-sm" />,
            color: 'text-gray-500',
            text: `${change}%`
        };
    };

    const statusInfo = getStatusInfo();

    const formatValue = (val) => {
        if (isCurrency || unit === 'VND') {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                notation: 'compact',
                compactDisplay: 'short',
                minimumFractionDigits: 0
            }).format(val);
        }

        if (val >= 1000) {
            return new Intl.NumberFormat('vi-VN', {
                notation: 'compact',
                compactDisplay: 'short'
            }).format(val);
        }

        return val;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${iconBgColor}`}></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-40 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-blue-100">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgColor}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
                    {note && (
                        <p className="text-xs text-gray-400 mt-1">{note}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatValue(value)}
                    </h2>
                    {unit && !isCurrency && unit !== 'VND' && (
                        <span className="text-sm text-gray-500">{unit}</span>
                    )}
                </div>

                <div className={`flex items-center gap-1 ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="text-sm font-medium">{statusInfo.text}</span>
                </div>

                {description && (
                    <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">{description}</p>
                )}
            </div>
        </div>
    );
};

export default KPICard;