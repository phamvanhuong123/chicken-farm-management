import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const WeeklyConsumptionChart = ({ data, loading = false }) => {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data && data.data && data.data.length > 0) {
            // Dữ liệu từ BE đã có thứ tự đúng: Ngày 1 (hôm nay) đến Ngày 7 (6 ngày trước)
            const formattedData = data.data.map(item => ({
                name: item.dayLabel, // "Ngày 1", "Ngày 2", ...
                'Thức ăn': item.food,
                'Thuốc & Vaccine': item.medicine,
                total: item.total,
                date: item.displayDate, // "dd-mm"
                dayNumber: item.dayNumber, // 1-7
                originalDay: item.dayLabel
            }));

            setChartData(formattedData);
        }
    }, [data]);

    // CustomTooltip component giữ nguyên
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const foodValue = payload.find(p => p.dataKey === 'Thức ăn')?.value || 0;
            const medicineValue = payload.find(p => p.dataKey === 'Thuốc & Vaccine')?.value || 0;
            const totalValue = foodValue + medicineValue;
            const date = payload[0]?.payload?.date || '';
            const dayNumber = payload[0]?.payload?.dayNumber || '';

            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <div className="mb-2">
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500">
                            {date} {dayNumber === 1 ? '(Hôm nay)' : `(Ngày ${dayNumber})`}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-green-500"></div>
                                <span className="text-sm text-gray-700">Thức ăn</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {foodValue.toLocaleString('vi-VN')} kg
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-orange-500"></div>
                                <span className="text-sm text-gray-700">Thuốc & Vaccine</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {medicineValue.toLocaleString('vi-VN')} kg
                            </span>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between font-semibold">
                                <span className="text-gray-900">Tổng cộng</span>
                                <span className="text-gray-900">{totalValue.toLocaleString('vi-VN')} kg</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = (props) => {
        const { payload } = props;
        return (
            <div className="flex items-center justify-center gap-6 mt-4 mb-2">
                {payload.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-700">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            {data?.title || 'Tiêu thụ 7 ngày gần nhất'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {data?.description || 'Thống kê tiêu thụ thức ăn và thuốc 7 ngày gần nhất'}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                            {data?.period === '7d' ? '7 ngày gần nhất' : data?.period}
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-64 min-h-[16rem]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                        barSize={32}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            width={50}
                            tickFormatter={(value) => value.toLocaleString('vi-VN')}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        />
                        <Legend
                            content={<CustomLegend />}
                            verticalAlign="top"
                            height={36}
                        />
                        <Bar
                            dataKey="Thức ăn"
                            stackId="a"
                            fill="#4CAF50"
                            name="Thức ăn"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                            animationBegin={200}
                        />
                        <Bar
                            dataKey="Thuốc & Vaccine"
                            stackId="a"
                            fill="#FF9800"
                            name="Thuốc & Vaccine"
                            radius={[4, 4, 0, 0]}
                            animationDuration={1500}
                            animationBegin={400}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {data?.total?.food?.toLocaleString('vi-VN') || 0}
                        </div>
                        <div className="text-sm text-gray-600">Thức ăn (kg)</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                            {data?.total?.medicine?.toLocaleString('vi-VN') || 0}
                        </div>
                        <div className="text-sm text-gray-600">Thuốc & Vaccine (kg)</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {data?.total?.overall?.toLocaleString('vi-VN') || 0}
                        </div>
                        <div className="text-sm text-gray-600">Tổng tiêu thụ (kg)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyConsumptionChart;