"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function BarChartCard({
  title,
  data,
  dataKey,
  nameKey,
  color = "#1F4E5A",
}: {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  color?: string;
}) {
  return (
    <div className="card">
      <h3 className="mb-3 font-semibold text-brand">{title}</h3>
      <div className="h-64 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey={nameKey} width={160} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
