import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const FeedCard = ({
    title,
    value,
    unit,
    status,
    label,
    color,
    loading = false,
    icon,
    iconBgColor = 'bg-gray-50'
}) => {
    const getStatusColor = () => {
        switch (color) {
            case 'red': return 'border-red-500 bg-red-50';
            case 'orange': return 'border-orange-500 bg-orange-50';
            case 'green': return 'border-green-500 bg-green-50';
            case 'gray': return 'border-gray-500 bg-gray-50';
            default: return 'border-gray-500 bg-gray-50';
        }
    };

    const getStatusBadgeColor = () => {
        switch (color) {
            case 'red': return 'bg-red-100 text-red-800';
            case 'orange': return 'bg-orange-100 text-orange-800';
            case 'green': return 'bg-green-100 text-green-800';
            case 'gray': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const containerClasses = `bg-white rounded-lg shadow-sm p-4 border-l-4 transition-all duration-300 hover:shadow-lg h-full ${getStatusColor()}`;

    if (loading) {
        return (
            <div className={containerClasses}>
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
        <div className={containerClasses}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBgColor}`}>
                    {icon || <FaShoppingCart className={
                        color === 'red' ? 'text-red-500 text-base' :
                            color === 'orange' ? 'text-orange-500 text-base' :
                                color === 'green' ? 'text-green-500 text-base' :
                                    color === 'gray' ? 'text-gray-500 text-base' :
                                        'text-gray-500 text-base'
                    } />}
                </div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide truncate">
                    {title}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                        {new Intl.NumberFormat('vi-VN').format(value)}
                    </h2>
                    <span className="text-xs text-gray-500">{unit}</span>
                </div>

                <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
                        {label}
                    </span>
                </div>

                <p className="text-xs text-gray-400 truncate">Lượng thức ăn tiêu thụ hôm nay</p>
            </div>
        </div>
    );
};

export default FeedCard;