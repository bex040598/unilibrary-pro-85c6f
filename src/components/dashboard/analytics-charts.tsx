"use client";

import { BarChart, Bar, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const palette = ["#0B2D4D", "#1E5AA8", "#D6A84F", "#0E9F9A", "#2E90FA", "#12B76A", "#F79009", "#F04438"];

export function AnalyticsCharts({
  resourcesByCategory,
  downloadsByMonth,
  viewsByMonth,
  reservationTrend,
  loanTrend,
  topSearchKeywords
}: {
  resourcesByCategory: Array<{ label: string; value: number }>;
  downloadsByMonth: Array<{ month: string; count: number }>;
  viewsByMonth: Array<{ month: string; count: number }>;
  reservationTrend: Array<{ month: string; count: number }>;
  loanTrend: Array<{ month: string; count: number }>;
  topSearchKeywords: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-border bg-surface p-4">
        <h3 className="mb-4 text-lg font-semibold">Resource count by category</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resourcesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1E5AA8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4">
        <h3 className="mb-4 text-lg font-semibold">Downloads and views by month</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={downloadsByMonth.map((item, index) => ({ ...item, views: viewsByMonth[index]?.count ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Downloads" stroke="#1E5AA8" strokeWidth={3} />
              <Line type="monotone" dataKey="views" name="Views" stroke="#D6A84F" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4">
        <h3 className="mb-4 text-lg font-semibold">Reservation and loan trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reservationTrend.map((item, index) => ({ ...item, loans: loanTrend[index]?.count ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Reservations" fill="#0E9F9A" radius={[8, 8, 0, 0]} />
              <Bar dataKey="loans" name="Loans" fill="#2E90FA" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4">
        <h3 className="mb-4 text-lg font-semibold">Top search keywords</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={topSearchKeywords} dataKey="value" nameKey="label" outerRadius={110}>
                {topSearchKeywords.map((item, index) => (
                  <Cell key={item.label} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
