import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Sector
} from 'recharts';

const CostStructureChart = ({ data, loading = false }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeCategory, setActiveCategory] = useState(null);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 h-80 flex items-center justify-center animate-pulse">
                <div className="text-center">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
                    <div className="h-48 bg-gray-200 rounded-full w-48 mx-auto mt-4"></div>
                </div>
            </div>
        );
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 h-80 flex flex-col items-center justify-center">
                <div className="text-gray-400 mb-2">💰</div>
                <div className="text-gray-500 text-center">
                    <p className="font-medium">Không có dữ liệu chi phí</p>
                    <p className="text-sm mt-1">Chưa có dữ liệu material trong kho</p>
                </div>
            </div>
        );
    }

    const chartData = data.data.map(item => ({
        name: item.category,
        value: item.value,
        percentage: item.percentage,
        color: item.color,
        formattedValue: item.formattedValue || new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(item.value),
        description: item.description,
        icon: item.icon
    }));

    const totalCost = data.total?.formatted || '0 ₫';
    const period = data.total?.period || 'tháng';

    const COLORS = chartData.map(item => item.color);

    const renderActiveShape = (props) => {
        const {
            cx, cy, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value
        } = props;

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 5}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={2}
                />
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: data.color }}
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{data.name}</p>
                            <p className="text-xs text-gray-500">{data.description}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Giá trị:</span>
                            <span className="text-sm font-semibold text-gray-900">{data.formattedValue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">Tỷ lệ:</span>
                            <span className="text-sm font-semibold text-gray-900">{data.percentage}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => (
        <div className="flex flex-wrap gap-3 justify-center mt-4 mb-2">
            {payload.map((entry, index) => (
                <div
                    key={`legend-${index}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${activeCategory === entry.value ? 'bg-gray-100 ring-2 ring-offset-2 ring-opacity-50' : 'hover:bg-gray-50'}`}
                    style={{
                        '--ring-color': entry.color,
                        '--ring-opacity': '0.2'
                    }}
                    onClick={() => setActiveCategory(activeCategory === entry.value ? null : entry.value)}
                    onMouseEnter={() => setActiveCategory(entry.value)}
                    onMouseLeave={() => setActiveCategory(null)}
                >
                    <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm text-gray-700">{entry.value}</span>
                    <span className="text-sm font-medium text-gray-900">
                        {chartData.find(d => d.name === entry.value)?.percentage}%
                    </span>
                </div>
            ))}
        </div>
    );

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
        setActiveCategory(chartData[index].name);
    };

    const onPieLeave = () => {
        setActiveIndex(0);
        setActiveCategory(null);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{data.title || 'Cơ cấu chi phí'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {data.description || 'Phân bổ chi phí hoạt động trang trại'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                            {period === 'month' ? 'Tháng này' : period}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 h-64 min-h-[16rem]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onMouseLeave={onPieLeave}
                                animationDuration={1500}
                                animationBegin={300}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#ffffff"
                                        strokeWidth={2}
                                        opacity={activeCategory && activeCategory !== entry.name ? 0.3 : 1}
                                        className="transition-opacity duration-200"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                content={<CustomTooltip />}
                                wrapperStyle={{ outline: 'none' }}
                            />
                            <Legend
                                content={<CustomLegend />}
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="lg:w-1/3">
                    <div className="bg-gray-50 rounded-lg p-4 h-full border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Chi tiết chi phí
                        </h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {chartData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${activeCategory === item.name ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-white hover:shadow-sm'}`}
                                    onMouseEnter={() => setActiveCategory(item.name)}
                                    onMouseLeave={() => setActiveCategory(null)}
                                    onClick={() => setActiveCategory(activeCategory === item.name ? null : item.name)}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 truncate">{item.description}</div>
                                    <div className="text-sm font-bold text-gray-800 mt-1">{item.formattedValue}</div>
                                </div>
                            ))}

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-semibold text-gray-900">Tổng chi phí</span>
                                        <p className="text-xs text-gray-500 mt-1">Trong tháng này</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">{totalCost}</div>
                                        <div className="text-xs text-gray-500">Giá trị tổng</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostStructureChart;