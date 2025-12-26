import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const DashboardAlert = ({ alerts, loading = false }) => {
    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48"></div>
            </div>
        );
    }

    if (!alerts || alerts.length === 0) {
        return null;
    }

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'high':
                return <FaExclamationCircle className="text-red-500 text-lg" />;
            case 'medium':
                return <FaExclamationTriangle className="text-yellow-500 text-lg" />;
            default:
                return <FaInfoCircle className="text-blue-500 text-lg" />;
        }
    };

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'high':
                return 'border-red-200 bg-red-50';
            case 'medium':
                return 'border-yellow-200 bg-yellow-50';
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Cảnh báo hệ thống</h3>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                    {alerts.length} cảnh báo
                </span>
            </div>

            <div className="space-y-2">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getSeverityClass(alert.severity)} flex items-start gap-3`}
                    >
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{alert.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            {alert.timestamp && (
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(alert.timestamp).toLocaleString('vi-VN')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardAlert;