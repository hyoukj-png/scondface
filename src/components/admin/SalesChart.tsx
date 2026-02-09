"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Mon", value: 1200000 },
    { name: "Tue", value: 2100000 },
    { name: "Wed", value: 1800000 },
    { name: "Thu", value: 2800000 },
    { name: "Fri", value: 2300000 },
    { name: "Sat", value: 3500000 },
    { name: "Sun", value: 4200000 },
];

export default function SalesChart() {
    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `₩${(value / 10000).toLocaleString()}만`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(5, 5, 5, 0.8)',
                            borderColor: '#334155',
                            backdropFilter: 'blur(8px)',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#06b6d4' }}
                        formatter={(value: number | undefined) => [value ? `₩${value.toLocaleString()}` : "0", "Revenue"] as [string, string]}
                    />
                    <Area
                        type="monotone" // Bezier curve
                        dataKey="value"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={2000}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
