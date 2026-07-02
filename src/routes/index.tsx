import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ClipboardList, ScanLine, Users2, PieChart, TrendingUp,
  ArrowUp, ArrowDown, Search, Plus, Download, X, UserCog
} from "lucide-react";
import {
  ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Area, AreaChart, Line
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  getDashboard, getStudentsList, addStudent, getAttendanceLogs, 
  type DashboardData
} from "@/lib/dashboard.functions";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const { data: dashboardData } = useSuspenseQuery(dashOpts);
  
  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Search & Filter State
  const [studentSearch, setStudentSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceSession, setAttendanceSession] = useState("all");
  const [attendanceDate, setAttendanceDate] = useState(() => {
    // Default to local YYYY-MM-DD
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newHostel, setNewHostel] = useState("Female Hostel");
  const [newRoom, setNewRoom] = useState("");
  const [newNfc, setNewNfc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Queries for other tabs
  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudentsList(),
    enabled: activeTab === "students",
  });

  const attendanceQuery = useQuery({
    queryKey: ["attendance"],
    queryFn: () => getAttendanceLogs(),
    enabled: activeTab === "attendance",
  });

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newName) {
      setFormError("Student ID and Name are required");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await addStudent({
        data: {
          student_id: newId,
          name: newName,
          hostel: newHostel,
          room_no: newRoom || undefined,
          nfc_uid: newNfc || undefined,
        }
      });
      toast.success("Student added successfully!");
      setNewId("");
      setNewName("");
      setNewRoom("");
      setNewNfc("");
      setShowAddModal(false);
      
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to add student. Ensure RLS is disabled in Supabase.");
      toast.error(err.message || "Failed to add student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvExport = (logsToExport: any[]) => {
    if (!logsToExport || logsToExport.length === 0) {
      toast.error("No data available to export");
      return;
    }
    const headers = ["Time", "Student ID", "Student Name", "Hostel", "Room No", "Session", "Meal Name", "Method"];
    const rows = logsToExport.map(c => [
      formatDateTime(c.checked_in_at),
      c.student_id,
      c.student_name,
      c.hostel,
      c.room_no || "-",
      c.session_type,
      c.meal_name,
      c.method
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = attendanceDate || new Date().toISOString().split("T")[0];
    link.setAttribute("download", `crescent_mess_attendance_${dateStr}_${attendanceSession}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file exported successfully!");
  };

  const matchDate = (isoString: string, filterDate: string) => {
    if (!filterDate) return true;
    const dateObj = new Date(isoString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}` === filterDate;
  };

  const { totals, sessions, recent, weekly } = dashboardData;

  const renderTabContent = () => {
    switch (activeTab) {
      case "attendance": {
        const logs = attendanceQuery.data ?? [];
        
        // Filter logic
        const filteredLogs = logs.filter((log: any) => {
          const matchesSearch = 
            log.student_name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
            log.student_id.toLowerCase().includes(attendanceSearch.toLowerCase());
          const matchesSession = attendanceSession === "all" || log.session_type === attendanceSession;
          const matchesDate = matchDate(log.checked_in_at, attendanceDate);
          return matchesSearch && matchesSession && matchesDate;
        });

        return (
          <div className="space-y-6">
            {/* Filters Header */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search Name or ID..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-sidebar-primary text-foreground"
                    />
                  </div>
                  {/* Session Dropdown */}
                  <select
                    value={attendanceSession}
                    onChange={(e) => setAttendanceSession(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground font-medium"
                  >
                    <option value="all">All Meal Sessions</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Evening Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                  {/* Date Picker */}
                  <div className="relative">
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground"
                    />
                  </div>
                </div>
                
                {/* Export Button */}
                <button
                  onClick={() => handleCsvExport(filteredLogs)}
                  className="flex items-center justify-center gap-2 rounded-md bg-sidebar-primary px-4 py-2 text-sm font-medium text-sidebar-primary-foreground transition hover:bg-sidebar-primary/90 cursor-pointer"
                >
                  <Download size={16} /> Export to CSV
                </button>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Live Attendance Log</h3>
                <span className="rounded-full bg-sidebar-border/30 px-3 py-1 text-xs font-semibold text-foreground">
                  {filteredLogs.length} Records Found
                </span>
              </div>
              
              {attendanceQuery.isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">Loading logs...</div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No attendance records found matching filters.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground border-b border-border">
                        <th className="pb-3">Checked In At</th>
                        <th className="pb-3">Student ID</th>
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Hostel</th>
                        <th className="pb-3">Room No</th>
                        <th className="pb-3">Meal Session</th>
                        <th className="pb-3">Check-in Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLogs.map((c) => (
                        <tr key={c.id} className="text-foreground hover:bg-muted/10">
                          <td className="py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(c.checked_in_at)}</td>
                          <td className="py-3 font-medium">{c.student_id}</td>
                          <td className="py-3">{c.student_name}</td>
                          <td className="py-3 text-muted-foreground">{c.hostel}</td>
                          <td className="py-3 text-muted-foreground">{c.room_no || "-"}</td>
                          <td className="py-3 font-medium capitalize">{c.session_type}</td>
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
              )}
            </div>
          </div>
        );
      }

      case "students": {
        const studentList = studentsQuery.data ?? [];
        const filteredStudents = studentList.filter((s: any) => 
          s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.student_id.toLowerCase().includes(studentSearch.toLowerCase())
        );

        return (
          <div className="space-y-6">
            {/* Header filters */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-sidebar-primary text-foreground"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 rounded-md bg-sidebar-primary px-4 py-2 text-sm font-medium text-sidebar-primary-foreground transition hover:bg-sidebar-primary/90 cursor-pointer"
              >
                <Plus size={16} /> Add Student
              </button>
            </div>

            {/* Students Table */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Registered Students</h3>
                <span className="rounded-full bg-sidebar-border/30 px-3 py-1 text-xs font-semibold text-foreground">
                  {filteredStudents.length} Total Students
                </span>
              </div>

              {studentsQuery.isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No students found. Add one to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground border-b border-border">
                        <th className="pb-3">Student ID</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Hostel</th>
                        <th className="pb-3">Room No</th>
                        <th className="pb-3">NFC UID</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Added At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="text-foreground hover:bg-muted/10">
                          <td className="py-3 font-semibold">{s.student_id}</td>
                          <td className="py-3 font-medium">{s.name}</td>
                          <td className="py-3 text-muted-foreground">{s.hostel}</td>
                          <td className="py-3 text-muted-foreground">{s.room_no || "-"}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{s.nfc_uid || "Not linked"}</td>
                          <td className="py-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"}`}>
                              {s.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 text-muted-foreground text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Add Student Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-2xl animate-scale-in">
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Plus className="text-sidebar-primary" size={20} /> Add New Student
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-full p-1 hover:bg-muted text-muted-foreground"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  {formError && (
                    <div className="mb-4 text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-md">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleAddStudentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Student ID *</label>
                      <input
                        type="text"
                        required
                        value={newId}
                        onChange={(e) => setNewId(e.target.value)}
                        placeholder="e.g. 21BCS1023"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Student Name *</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Ayesha Khan"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Hostel</label>
                      <select
                        value={newHostel}
                        onChange={(e) => setNewHostel(e.target.value)}
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground"
                      >
                        <option value="Female Hostel">Female Hostel</option>
                        <option value="Male Hostel">Male Hostel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Room No</label>
                      <input
                        type="text"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        placeholder="e.g. A-101"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">NFC UID (Optional)</label>
                      <input
                        type="text"
                        value={newNfc}
                        onChange={(e) => setNewNfc(e.target.value)}
                        placeholder="e.g. NFC001"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-sidebar-primary text-foreground font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-border mt-6">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-sidebar-primary px-4 py-2 text-sm font-medium text-sidebar-primary-foreground hover:bg-sidebar-primary/90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        {submitting ? "Adding..." : "Save Student"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Meals Today" value={totals.meals_today || 0} sub="Students Served"
                icon={ClipboardList} tint="blue" trend={{ up: true, text: "12%" }} />
              <StatCard label="Total Check-ins" value={totals.unique_students || 0} sub="Unique Students"
                icon={ScanLine} tint="green" trend={{ up: true, text: "11%" }} />
              <StatCard label="Expected Count" value={totals.expected || 420} sub="Expected Students"
                icon={Users2} tint="purple" trend={{ up: false, text: "6%" }} />
              <StatCard label="Attendance Rate" value={`${totals.attendance_rate || 0}%`} sub="of Expected"
                icon={PieChart} tint="orange" trend={{ up: true, text: "5%" }} />
            </div>

            {/* Chart + sessions */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
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
                  <button onClick={() => setActiveTab("attendance")} className="text-xs font-medium text-brand-blue hover:underline cursor-pointer bg-transparent border-0">View Log</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-3">Session</th>
                        <th className="pb-3">Meal</th>
                        <th className="pb-3">Time</th>
                        <th className="pb-3 text-right">Check-ins</th>
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
                          <td className="py-3 font-semibold text-right">{s.check_ins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent + Top stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">Recent Check-ins</h3>
                  <button onClick={() => setActiveTab("attendance")} className="text-xs font-medium text-brand-blue hover:underline cursor-pointer bg-transparent border-0">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-3">Time</th>
                        <th className="pb-3">Student ID</th>
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Meal</th>
                        <th className="pb-3">Method</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(recent.length ? recent : FALLBACK_RECENT).map((c) => (
                        <tr key={c.id} className="text-foreground">
                          <td className="py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(c.checked_in_at)}</td>
                          <td className="py-3 font-medium">{c.student_id}</td>
                          <td className="py-3">{c.student_name}</td>
                          <td className="py-3 text-muted-foreground capitalize">{c.session_type}</td>
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
                </div>
                <DonutStat label="Most Attendance" value="Lunch" sub="218 Students" color="oklch(0.55 0.2 260)" />
                <DonutStat label="Least Attendance" value="Snacks" sub="98 Students" color="oklch(0.7 0.18 60)" />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Peak Time</div>
                    <div className="mt-0.5 text-sm font-semibold text-foreground font-mono">12:30 PM - 01:30 PM</div>
                    <div className="text-xs text-muted-foreground">156 Check-ins</div>
                  </div>
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <TrendingUp size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout 
      title={activeTab === "dashboard" ? "Mess Attendance System" : activeTab === "attendance" ? "Attendance Log & Export" : "Student Directory"} 
      subtitle="Female Hostel"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderTabContent()}
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
  const h = d.getHours(); // Local hour
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${pad(h12)}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${suffix}`;
}

const FALLBACK_RECENT = [
  { id: "1", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BCS1023", student_name: "Ayesha Khan", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "2", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BEC1045", student_name: "Fathima Noor", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "3", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BME1078", student_name: "Sana Fathima", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "4", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BIT1089", student_name: "Hibah Thasneem", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
  { id: "5", checked_in_at: new Date().toISOString(), method: "NFC Card", student_id: "21BCE1102", student_name: "K. Nivetha", hostel: "Female Hostel", session_type: "breakfast", meal_name: "Breakfast" },
];
