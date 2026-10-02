import { useState, useMemo } from "react";
import {
  Printer, BarChart2, Calendar, FileText, DollarSign,
  Camera, Users, CheckCircle, XCircle, Flag, Search,
  TrendingUp, Download, Filter, ChevronRight,
  MoveRight
} from "lucide-react";
import AdminSidebar from "../../components/layout/AdminSidebar";
import { useBooking } from "../../context/BookingContext";
import { useAuth } from "../../context/AuthContext";
import { PHOTOGRAPHERS } from "../../data/mockData";

export default function ManageReports() {
  const { allBookings } = useBooking();
  const { photographersList } = useAuth();

  // Active Tab: overview | bookings | revenue | photographers | users
  const [activeTab, setActiveTab] = useState("overview");

  // Date filters
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];
  const firstDayOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState(todayStr);
  const [filterApplied, setFilterApplied] = useState({ from: "2025-01-01", to: todayStr });

  // Search & Status filters for bookings tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleApplyFilter = () => {
    setFilterApplied({ from: fromDate, to: toDate });
  };

  const handleSetThisMonth = () => {
    setFromDate(firstDayOfMonth);
    setToDate(todayStr);
    setFilterApplied({ from: firstDayOfMonth, to: todayStr });
  };

  const handleSetThisYear = () => {
    setFromDate(firstDayOfYear);
    setToDate(todayStr);
    setFilterApplied({ from: firstDayOfYear, to: todayStr });
  };

  const handlePrint = () => {
    window.print();
  };

  // Combine live photographers with static
  const photographers = useMemo(() => {
    return [
      ...(photographersList || []),
      ...PHOTOGRAPHERS.filter(mp => !(photographersList || []).some(lp => lp.id === mp.id)),
    ];
  }, [photographersList]);

  // Filter bookings based on date range
  const filteredBookings = useMemo(() => {
    return (allBookings || []).filter((b) => {
      // Try to parse booking date
      const bDateStr = b.date || b.eventDate || "";
      if (!bDateStr) return true;
      try {
        const bDate = new Date(bDateStr);
        if (isNaN(bDate.getTime())) return true;
        const from = new Date(filterApplied.from);
        const to = new Date(filterApplied.to);
        to.setHours(23, 59, 59);
        return bDate >= from && bDate <= to;
      } catch (e) {
        return true;
      }
    });
  }, [allBookings, filterApplied]);

  // Calculations
  const totalBookings = filteredBookings.length || 0;
  const confirmedCount = filteredBookings.filter(b => b.status === "Confirmed").length;
  const completedCount = filteredBookings.filter(b => b.status === "Completed").length;
  const cancelledCount = filteredBookings.filter(b => b.status === "Cancelled").length;
  const photographerSessions = filteredBookings.filter(b => b.status !== "Cancelled").length;

  // Registered users count (distinct clients from bookings + mock base)
  const uniqueClients = useMemo(() => {
    const map = new Map();
    filteredBookings.forEach(b => {
      const name = b.client || b.customerName || b.name || "Client";
      const email = b.email || b.customerEmail || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      const phone = b.phone || b.customerPhone || "+94 77 123 4567";
      const amt = Number(b.totalAmount || b.amount || 0);

      if (!map.has(name)) {
        map.set(name, { name, email, phone, bookingsCount: 1, totalSpent: amt, lastDate: b.date || b.eventDate || "Recent" });
      } else {
        const cur = map.get(name);
        cur.bookingsCount += 1;
        cur.totalSpent += amt;
        map.set(name, cur);
      }
    });
    return Array.from(map.values());
  }, [filteredBookings]);

  const registeredUsersCount = Math.max(10, uniqueClients.length);

  // Revenue calculations
  const totalGrossRevenue = filteredBookings
    .filter(b => b.status !== "Cancelled")
    .reduce((sum, b) => sum + Number(b.totalAmount || b.amount || 0), 0);

  const advanceDepositsCollected = filteredBookings
    .filter(b => b.status !== "Cancelled")
    .reduce((sum, b) => sum + Number(b.depositPaid || (b.totalAmount || b.amount || 0) * 0.3), 0);

  const remainingBalanceDue = filteredBookings
    .filter(b => b.status === "Confirmed")
    .reduce((sum, b) => sum + Number(b.balanceRemaining || (b.totalAmount || b.amount || 0) * 0.7), 0);

  // Booking Type Breakdown (Time-Based vs Package-Based)
  const timeBasedCount = filteredBookings.filter(b => b.bookingType === "time_based" || (b.time && !b.package)).length || Math.round(totalBookings * 0.7);
  const packageBasedCount = totalBookings - timeBasedCount > 0 ? totalBookings - timeBasedCount : Math.max(0, Math.round(totalBookings * 0.3));
  const timeBasedPct = totalBookings > 0 ? Math.round((timeBasedCount / totalBookings) * 100) : 70;
  const packageBasedPct = totalBookings > 0 ? 100 - timeBasedPct : 30;

  // Revenue by Category / Photographer (similar to "Revenue by Court")
  const revenueByPhotographer = useMemo(() => {
    const map = {};
    photographers.forEach(p => {
      map[p.name] = { name: p.name, count: 0, revenue: 0 };
    });

    filteredBookings.forEach(b => {
      if (b.status === "Cancelled") return;
      const pName = b.photographer || b.photographerName || "Alex Morgan";
      if (!map[pName]) {
        map[pName] = { name: pName, count: 0, revenue: 0 };
      }
      map[pName].count += 1;
      map[pName].revenue += Number(b.totalAmount || b.amount || 45000);
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [photographers, filteredBookings]);

  const maxRevenue = Math.max(1, ...revenueByPhotographer.map(r => r.revenue));

  // Filtered Bookings for Table Tab
  const tableBookings = useMemo(() => {
    return filteredBookings.filter(b => {
      const matchesStatus = statusFilter === "All" || b.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (b.id || "").toLowerCase().includes(q) ||
        (b.client || b.customerName || "").toLowerCase().includes(q) ||
        (b.photographer || b.photographerName || "").toLowerCase().includes(q) ||
        (b.event || b.photographyType || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [filteredBookings, statusFilter, searchQuery]);

  return (
    <div className="admin-layout" style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <main className="admin-main reports-main" style={{ padding: "28px 36px" }}>
        
        {/* ── Top Header Banner (Inspired by green reports header in uploaded image) ── */}
        <div className="reports-header-banner animate-fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="reports-header-icon">
              <BarChart2 size={24} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.02em" }}>
                Reports
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.85rem", margin: "3px 0 0" }}>
                Booking overview and analytical reports
              </p>
              <br/>
              <button className="btn btn-print" onClick={handlePrint}>
            <Printer size={16} /> Print / Export PDF
            <div style={{ marginRight: "auto"}}></div>
          </button>
            </div>
          </div>

         
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="reports-tabs-bar animate-fade-up delay-1">
          {[
            { id: "overview", label: "Overview", icon: "📑" },
            { id: "bookings", label: "Bookings", icon: "📋" },
            { id: "revenue", label: "Revenue", icon: "💰" },
            { id: "photographers", label: "Photographer Sessions", icon: "📸" },
            { id: "users", label: "Users", icon: "👥" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`reports-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div className="reports-filter-card animate-fade-up delay-1">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                From Date
              </label>
              <input
                type="date"
                className="form-control reports-date-input"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                To Date
              </label>
              <input
                type="date"
                className="form-control reports-date-input"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div style={{ alignSelf: "flex-end", display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-filter-go" onClick={handleApplyFilter}>
                <Search size={15} /> Filter
              </button>
              <button className="btn btn-quick-filter" onClick={handleSetThisMonth}>
                This Month
              </button>
              <button className="btn btn-quick-filter" onClick={handleSetThisYear}>
                This Year
              </button>
            </div>

            <div style={{ marginLeft: "auto", alignSelf: "center", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Period: <strong style={{ color: "#60a5fa" }}>{filterApplied.from}</strong> to <strong style={{ color: "#60a5fa" }}>{filterApplied.to}</strong>
            </div>
          </div>
        </div>

        {/* ── TAB 1: OVERVIEW (Matching uploaded image layout) ── */}
        {activeTab === "overview" && (
          <div className="animate-fade-up delay-2">
            
            {/* System Overview Subtitle */}
            <div className="overview-title-badge">
              System Overview — Shutter Moments Studio
            </div>

            {/* 7 Stat Cards Grid */}
            <div className="reports-7stat-grid">
              {/* Total Bookings */}
              <div className="rep-stat-card border-gold">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
                  📋
                </div>
                <div className="rep-stat-label">TOTAL BOOKINGS</div>
                <div className="rep-stat-value">{totalBookings}</div>
              </div>

              {/* Confirmed */}
              <div className="rep-stat-card border-green">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22c55e" }}>
                  ✅
                </div>
                <div className="rep-stat-label">CONFIRMED</div>
                <div className="rep-stat-value">{confirmedCount}</div>
              </div>

              {/* Completed */}
              <div className="rep-stat-card border-emerald">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981" }}>
                  🏁
                </div>
                <div className="rep-stat-label">COMPLETED</div>
                <div className="rep-stat-value">{completedCount}</div>
              </div>

              {/* Cancelled */}
              <div className="rep-stat-card border-red">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
                  ❌
                </div>
                <div className="rep-stat-label">CANCELLED</div>
                <div className="rep-stat-value">{cancelledCount}</div>
              </div>

              {/* Photographer Sessions */}
              <div className="rep-stat-card border-purple">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7" }}>
                  📸
                </div>
                <div className="rep-stat-label">SESSIONS</div>
                <div className="rep-stat-value">{photographerSessions}</div>
              </div>

              {/* Registered Users */}
              <div className="rep-stat-card border-blue">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(37, 99, 235, 0.15)", color: "#3b82f6" }}>
                  👥
                </div>
                <div className="rep-stat-label">REGISTERED USERS</div>
                <div className="rep-stat-value">{registeredUsersCount}</div>
              </div>

              {/* Total Revenue */}
              <div className="rep-stat-card border-amber">
                <div className="rep-stat-icon-wrap" style={{ background: "rgba(234, 179, 8, 0.15)", color: "#eab308" }}>
                  💰
                </div>
                <div className="rep-stat-label">TOTAL REVENUE</div>
                <div className="rep-stat-value revenue-val">
                  LKR {totalGrossRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Booking Type Breakdown */}
            <div className="rep-card-panel" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: "1.2rem" }}>📊</span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Booking Type Breakdown
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Time-Based Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Time-Based:
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill green-fill"
                      style={{ width: `${Math.max(15, timeBasedPct)}%` }}
                    >
                      {timeBasedCount} ({timeBasedPct}%)
                    </div>
                  </div>
                </div>

                {/* Package-Based Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    Package-Based:
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill green-fill"
                      style={{ width: `${Math.max(12, packageBasedPct)}%` }}
                    >
                      {packageBasedCount} ({packageBasedPct}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue by Photographer (matches "Revenue by Court" in image) */}
            <div className="rep-card-panel">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <span style={{ fontSize: "1.2rem" }}>📈</span>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Revenue by Photographer
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {revenueByPhotographer.map((item, idx) => {
                  const pct = Math.max(10, Math.round((item.revenue / maxRevenue) * 100));
                  return (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {item.name}:
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill blue-fill"
                          style={{ width: `${pct}%` }}
                        >
                          LKR {item.revenue.toLocaleString()} ({item.count} bookings)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 2: BOOKINGS TABLE ── */}
        {activeTab === "bookings" && (
          <div className="animate-fade-up">
            <div className="rep-card-panel" style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                {/* Search */}
                <div style={{ position: "relative", minWidth: 260 }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search client, ID, photographer..."
                    style={{ paddingLeft: 36, fontSize: "0.85rem", background: "var(--navy-900)" }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {["All", "Confirmed", "Completed", "Cancelled"].map(st => (
                    <button
                      key={st}
                      className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-quick-filter"}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Photography Type</th>
                    <th>Photographer</th>
                    <th>Amount (LKR)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tableBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
                        No bookings found for the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    tableBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: "#60a5fa" }}>{b.id}</td>
                        <td>{b.date || b.eventDate || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{b.client || b.customerName || b.name || "Client"}</td>
                        <td>{b.event || b.photographyType || "Photo Shoot"}</td>
                        <td>{b.photographer || b.photographerName || "Alex Morgan"}</td>
                        <td style={{ fontWeight: 700, color: "#ffffff" }}>
                          Rs. {Number(b.totalAmount || b.amount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === "Confirmed" ? "badge-confirmed" :
                              b.status === "Completed" ? "badge-completed" : "badge-cancelled"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: REVENUE ANALYTICS ── */}
        {activeTab === "revenue" && (
          <div className="animate-fade-up">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #2563eb", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>Total Gross Revenue</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#ffffff" }}>
                  Rs. {totalGrossRevenue.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#60a5fa", marginTop: 4 }}>
                  From {totalBookings} booked sessions
                </div>
              </div>

              <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #16a34a", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>30% Advance Collected</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#4ade80" }}>
                  Rs. {advanceDepositsCollected.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#86efac", marginTop: 4 }}>
                  Secured deposits paid upfront
                </div>
              </div>

              <div className="card-elevated" style={{ padding: 20, borderLeft: "4px solid #eab308", background: "var(--navy-800)", border: "1px solid var(--navy-600)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>70% Remaining Balance Due</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#facc15" }}>
                  Rs. {remainingBalanceDue.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#fef08a", marginTop: 4 }}>
                  Payable on the event day
                </div>
              </div>
            </div>

            <div className="rep-card-panel">
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", marginBottom: 16 }}>
                Financial Breakdown by Photographer
              </h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Photographer</th>
                      <th>Shoots Count</th>
                      <th>Total Booked Amount</th>
                      <th>Advance Collected (30%)</th>
                      <th>Balance Receivable (70%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueByPhotographer.map((p, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: "#ffffff" }}>{p.name}</td>
                        <td>{p.count}</td>
                        <td style={{ fontWeight: 700, color: "#60a5fa" }}>Rs. {p.revenue.toLocaleString()}</td>
                        <td style={{ color: "#4ade80", fontWeight: 600 }}>Rs. {Math.round(p.revenue * 0.3).toLocaleString()}</td>
                        <td style={{ color: "#facc15", fontWeight: 600 }}>Rs. {Math.round(p.revenue * 0.7).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: PHOTOGRAPHER SESSIONS ── */}
        {activeTab === "photographers" && (
          <div className="animate-fade-up">
            <div className="rep-card-panel">
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", marginBottom: 16 }}>
                Photographer Performance & Sessions Summary
              </h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Photographer</th>
                      <th>Specialization</th>
                      <th>Assigned Shoots</th>
                      <th>Completed</th>
                      <th>Revenue Contributed</th>
                      <th>Client Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {photographers.map((p, idx) => {
                      const pBookings = filteredBookings.filter(b => (b.photographer || b.photographerName) === p.name);
                      const pDone = pBookings.filter(b => b.status === "Completed").length;
                      const pRev = pBookings.filter(b => b.status !== "Cancelled").reduce((s, b) => s + Number(b.totalAmount || b.amount || 0), 0);
                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700, color: "#ffffff" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <img src={p.avatar} alt={p.name} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                              {p.name}
                            </div>
                          </td>
                          <td>{p.specialization || "Photography"}</td>
                          <td>{pBookings.length}</td>
                          <td style={{ color: "#4ade80", fontWeight: 600 }}>{pDone}</td>
                          <td style={{ fontWeight: 700, color: "#60a5fa" }}>Rs. {pRev.toLocaleString()}</td>
                          <td style={{ color: "#facc15", fontWeight: 700 }}>★ {p.rating || 4.9}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: USERS / CLIENTS REPORT ── */}
        {activeTab === "users" && (
          <div className="animate-fade-up">
            <div className="rep-card-panel">
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#ffffff", marginBottom: 16 }}>
                Registered Customers & Client Activity
              </h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email Address</th>
                      <th>Phone</th>
                      <th>Bookings Made</th>
                      <th>Total Spend (LKR)</th>
                      <th>Last Reservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueClients.map((u, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700, color: "#ffffff" }}>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>{u.bookingsCount}</td>
                        <td style={{ fontWeight: 700, color: "#4ade80" }}>Rs. {u.totalSpent.toLocaleString()}</td>
                        <td style={{ color: "var(--text-muted)" }}>{u.lastDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .reports-header-banner {
          background: linear-gradient(135deg, #15803d, #166534);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          display: flex;
          justifyContent: space-between;
          align-items: center;
          margin-bottom: 22px;
          box-shadow: 0 8px 24px rgba(22, 101, 52, 0.3);
        }
        .reports-header-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .btn-print {
          background: #ffffff;
          color: #166534;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: none;
          transition: var(--transition);
        }
        .btn-print:hover {
          background: #f0fdf4;
          transform: translateY(-2px);
        }

        /* Tabs Bar */
        .reports-tabs-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .reports-tab-btn {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          color: var(--text-secondary);
          font-size: 0.86rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: var(--transition);
        }
        .reports-tab-btn:hover {
          background: var(--navy-700);
          color: #ffffff;
          border-color: #3b82f6;
        }
        .reports-tab-btn.active {
          background: #16a34a;
          color: #ffffff;
          border-color: #16a34a;
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
        }

        /* Filter Card */
        .reports-filter-card {
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: var(--radius-lg);
          padding: 18px 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .reports-date-input {
          width: 170px;
          padding: 8px 12px;
          font-size: 0.86rem;
          background: var(--navy-900);
          border: 1px solid var(--navy-500);
          color: #ffffff;
        }
        .btn-filter-go {
          background: #16a34a;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.86rem;
          padding: 8px 18px;
          border-radius: var(--radius-md);
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-filter-go:hover { background: #15803d; }
        .btn-quick-filter {
          background: var(--navy-700);
          border: 1px solid var(--navy-500);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.84rem;
          padding: 8px 16px;
          border-radius: var(--radius-md);
        }
        .btn-quick-filter:hover {
          background: var(--navy-600);
          color: #ffffff;
        }

        /* Subtitle */
        .overview-title-badge {
          text-align: center;
          font-size: 1.1rem;
          font-weight: 800;
          color: #4ade80;
          margin-bottom: 22px;
          letter-spacing: -0.01em;
        }

        /* 7 Stat Cards Row */
        .reports-7stat-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .rep-stat-card {
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .rep-stat-card:hover { transform: translateY(-3px); }
        .rep-stat-icon-wrap {
          width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; margin-bottom: 8px;
        }
        .rep-stat-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .rep-stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 900;
          color: #ffffff;
        }
        .rep-stat-value.revenue-val {
          font-size: 0.95rem;
          color: #facc15;
          margin-top: 4px;
        }

        /* Borders on stat cards */
        .border-gold   { border-top: 3px solid #f59e0b; }
        .border-green  { border-top: 3px solid #22c55e; }
        .border-emerald{ border-top: 3px solid #10b981; }
        .border-red    { border-top: 3px solid #ef4444; }
        .border-purple { border-top: 3px solid #a855f7; }
        .border-blue   { border-top: 3px solid #3b82f6; }
        .border-amber  { border-top: 3px solid #eab308; }

        /* Card panel */
        .rep-card-panel {
          background: var(--navy-800);
          border: 1px solid var(--navy-600);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Progress Bars */
        .progress-track {
          background: var(--navy-900);
          border: 1px solid var(--navy-600);
          border-radius: 6px;
          height: 32px;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .progress-fill {
          height: 100%;
          display: flex;
          align-items: center;
          padding: 0 14px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        .green-fill {
          background: linear-gradient(90deg, #16a34a, #22c55e);
        }
        .blue-fill {
          background: linear-gradient(90deg, #1d4ed8, #2563eb);
        }

        @media (max-width: 1200px) {
          .reports-7stat-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 768px) {
          .reports-7stat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ── Print / PDF Stylesheet ── */
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .admin-sidebar, .reports-tabs-bar, .reports-filter-card, .btn-print {
            display: none !important;
          }
          .admin-main, .reports-main {
            margin-left: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .reports-header-banner {
            background: #166534 !important;
            color: #ffffff !important;
            box-shadow: none !important;
          }
          .rep-stat-card, .rep-card-panel {
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }
          .rep-stat-value { color: #0f172a !important; }
          .data-table th { background: #e2e8f0 !important; color: #0f172a !important; }
          .data-table td { color: #0f172a !important; border-bottom: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
}
