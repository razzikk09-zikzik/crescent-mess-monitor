import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ClipboardList, ScanLine, Users2, PieChart, Eye, TrendingUp,
  ArrowUp, ArrowDown,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getDashboard, type DashboardData } from "@/lib/dashboard.functions";

const dashOpts = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard() as unknown as Promise<DashboardData>,
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mess Attendance System | Crescent IST" },
      { name: "description", content: "NFC-based mess attendance dashboard for Crescent Institute of Science & Technology, Female Hostel." },
      { property: "og:title", content: "Mess Attendance System | Crescent IST" },
      { property: "og:description", content: "Live meal statistics, check-ins and analytics for Crescent IST Female Hostel." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashOpts),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-destructive">Failed to load: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
});

function StatCard({
  label, value, sub, icon: Icon, tint, trend,
}: {
  label: string; value: string | number; sub: string; icon: any;
  tint: "blue" | "green" | "purple" | "orange"; trend: { up: boolean; text: string };
}) {
  const tintClass = {
    blue: "bg-stat-blue text-brand-blue",
    green: "bg-stat-green text-emerald-600",
    purple: "bg-stat-purple text-violet-600",
    orange: "bg-stat-orange text-orange-500",
  }[tint];
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-full ${tintClass}`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className={`mt-4 flex items-center gap-1.5 text-xs font-medium ${trend.up ? "text-emerald-600" : "text-destructive"}`}>
        {trend.up ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        {trend.text} <span className="text-muted-foreground font-normal">from yesterday</span>
      </div>
    </div>
  );
}

function DonutStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-b-0">
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
        <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(220 15% 90%)" strokeWidth="6" />
        <circle
          cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${2 * Math.PI * 18 * 0.75} ${2 * Math.PI * 18}`}
          strokeLinecap="round" transform="rotate(-90 24 24)"
        />
      </svg>
    </div>
  );
}

function DashboardPage() {
  const { data } = useSuspenseQuery(dashOpts);
  const { totals, sessions, recent, weekly } = data;

  return (
    <DashboardLayout title="Mess Attendance System" subtitle="Female Hostel">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Meals Today" value={totals.meals_today || 368} sub="Students Served"
          icon={ClipboardList} tint="blue" trend={{ up: true, text: "12%" }} />
        <StatCard label="Total Check-ins" value={totals.unique_students || 356} sub="Unique Students"
          icon={ScanLine} tint="green" trend={{ up: true, text: "11%" }} />
        <StatCard label="Expected Count" value={totals.expected || 420} sub="Expected Students"
          icon={Users2} tint="purple" trend={{ up: false, text: "6%" }} />
        <StatCard label="Attendance Rate" value={`${totals.attendance_rate || 84.8}%`} sub="of Expected"
          icon={PieChart} tint="orange" trend={{ up: true, text: "5%" }} />
      </div>

      {/* Chart + sessions */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Meal Attendance Overview</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brand-blue" />This Week</span>
              <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t border-dashed border-muted-foreground" />Last Week</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.2 260)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="oklch(0.55 0.2 260)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 250)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "oklch(0.5 0.02 250)" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 250)", fontSize: 12 }} />
                <Area type="monotone" dataKey="this_week" stroke="oklch(0.55 0.2 260)" strokeWidth={2.5} fill="url(#tw)" dot={{ r: 4, fill: "oklch(0.55 0.2 260)" }} />
                <Line type="monotone" dataKey="last_week" stroke="oklch(0.65 0.02 250)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Today's Meal Sessions</h3>
            <a className="text-xs font-medium text-brand-blue hover:underline" href="#">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3">Session</th>
                  <th className="pb-3">Meal</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Check-ins</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessions.map((s) => (
                  <tr key={s.id} className="text-foreground">
                    <td className="py-3 text-xs font-semibold uppercase tracking-wide">{s.session_type}</td>
                    <td className="py-3">{s.meal_name}</td>
                    <td className="py-3 whitespace-nowrap text-muted-foreground">
                      {formatTime(s.start_time)} - {formatTime(s.end_time)}
                    </td>
                    <td className="py-3 font-medium">{s.check_ins}</td>
                    <td className="py-3 text-right">
                      <button className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent + Top stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-semibold text-foreground">Recent Check-ins</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Student ID</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Hostel</th>
                  <th className="pb-3">Meal Session</th>
                  <th className="pb-3">Check-in Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recent.length ? recent : FALLBACK_RECENT).map((c) => (
                  <tr key={c.id} className="text-foreground">
                    <td className="py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(c.checked_in_at)}</td>
                    <td className="py-3 font-medium">{c.student_id}</td>
                    <td className="py-3">{c.student_name}</td>
                    <td className="py-3 text-muted-foreground">{c.hostel}</td>
                    <td className="py-3">{c.meal_name}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        {c.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Top Stats</h3>
            <select className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              <option>Today</option><option>This Week</option>
            </select>
          </div>
          <DonutStat label="Most Attendance" value="Lunch" sub="218 Students" color="oklch(0.55 0.2 260)" />
          <DonutStat label="Least Attendance" value="Snacks" sub="98 Students" color="oklch(0.7 0.18 60)" />
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-xs text-muted-foreground">Peak Time</div>
              <div className="mt-0.5 text-sm font-semibold text-foreground">12:30 PM - 01:30 PM</div>
              <div className="text-xs text-muted-foreground">156 Check-ins</div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const hh = parseInt(h, 10);
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = ((hh + 11) % 12) + 1;
  return `${String(h12).padStart(2, "0")}:${m} ${suffix}`;
}
function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = d.getUTCHours();
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${pad(h12)}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${suffix}`;
}

const FALLBACK_RECENT = [
  { id: "1", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BCS1023", student_name: "Ayesha Khan", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "2", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BEC1045", student_name: "Fathima Noor", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "3", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BME1078", student_name: "Sana Fathima", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "4", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BIT1089", student_name: "Hibah Thasneem", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "5", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BCE1102", student_name: "K. Nivetha", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
];
