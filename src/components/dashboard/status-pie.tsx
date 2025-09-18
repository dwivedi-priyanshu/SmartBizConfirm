"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type StatusPieProps = {
    data: { name: string; value: number }[];
};

const COLORS = [
    'hsl(142 76% 36%)',
    'hsl(221 83% 53%)',
    'hsl(48 96% 53%)',
    'hsl(0 84% 60%)',
    'hsl(280 65% 60%)',
];

export function StatusPie({ data }: StatusPieProps) {
    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Tooltip
                        contentStyle={{
                            background: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={24} />
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                        {data.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}


