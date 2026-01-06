import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const FeedCard = ({
    title,
    value,
    unit,
    color = 'gray',
    loading = false,
    icon,
    iconBgColor = 'bg-gray-50',
    note,
    description
}) => {
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
                    {icon || <FaShoppingCart className="text-gray-500 text-base" />}
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
                        {new Intl.NumberFormat('vi-VN').format(value)}
                    </h2>
                    {unit && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">{unit}</span>
                    )}
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

export default FeedCard;