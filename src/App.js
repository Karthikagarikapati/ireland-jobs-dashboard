import { useState, useEffect } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// ── Colour palette ────────────────────────────────────────────────────────────
const COLORS = ["#6366f1","#8b5cf6","#a78bfa","#c4b5fd",
                 "#818cf8","#4f46e5","#7c3aed","#9333ea"];
const HIGHLIGHT = "#6366f1";
const DIM       = "#334155";

// ── Load any CSV from /public/data/ ──────────────────────────────────────────
function useCSV(filename) {
  const [data, setData] = useState([]);
  useEffect(() => {
    Papa.parse(`/data/${filename}`, {
      download: true, header: true, dynamicTyping: true,
      complete: (r) => setData(r.data.filter(row =>
        Object.values(row).some(v => v !== null && v !== "")
      ))
    });
  }, [filename]);
  return data;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#1e1b4b,#312e81)",
      borderRadius: 12, padding: "20px 28px",
      flex: 1, minWidth: 160, textAlign: "center",
      boxShadow: "0 4px 24px #0004"
    }}>
      <div style={{ fontSize: 32, fontWeight: 800,
                    color: "#a78bfa" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#e2e8f0",
                    marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8",
                             marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h2 style={{ color: "#e2e8f0", fontSize: 18,
                 fontWeight: 700, marginBottom: 16,
                 borderLeft: "4px solid #6366f1",
                 paddingLeft: 12 }}>
      {children}
    </h2>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const master      = useCSV("output_master.csv");
  const categories  = useCSV("output_category_demand.csv");
  const cities      = useCSV("output_city_demand.csv");
  const companies   = useCSV("output_top_companies.csv");
  const boards      = useCSV("output_board_share.csv");
  const seniority   = useCSV("output_seniority_mix.csv");
  const dataTitles  = useCSV("output_data_titles.csv");
  const dataCompanies = useCSV("output_data_companies.csv");

  // ── Filter state (this is what makes everything interconnected) ──────────
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity,     setSelectedCity]     = useState(null);

  // ── Derived: filter master data based on selections ──────────────────────
  const filtered = master.filter(row => {
    const catMatch  = !selectedCategory ||
                      row.job_category === selectedCategory;
    const cityMatch = !selectedCity ||
                      row.city_clean   === selectedCity;
    return catMatch && cityMatch;
  });

  // ── Derived: recompute companies from filtered data ───────────────────────
  const filteredCompanies = Object.entries(
    filtered.reduce((acc, row) => {
      if (row.company) acc[row.company] = (acc[row.company] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([company, job_count]) => ({ company, job_count }))
    .sort((a, b) => b.job_count - a.job_count)
    .slice(0, 12);

  // ── Derived: recompute seniority from filtered data ───────────────────────
  const filteredSeniority = Object.entries(
    filtered.reduce((acc, row) => {
      if (row.seniority) acc[row.seniority] = (acc[row.seniority] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // ── Derived: recompute boards from filtered data ──────────────────────────
  const filteredBoards = Object.entries(
    filtered.reduce((acc, row) => {
      if (row.job_board) {
        const name = row.job_board.replace("_ie","").replace("2","");
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // ── Filter pills display ──────────────────────────────────────────────────
  const activeFilters = [
    selectedCategory && `Category: ${selectedCategory}`,
    selectedCity     && `City: ${selectedCity}`
  ].filter(Boolean);

  const card = {
    background: "#1e293b", borderRadius: 14,
    padding: 24, marginBottom: 24,
    boxShadow: "0 2px 16px #0003"
  };

  if (!master.length) return (
    <div style={{ background: "#0f172a", minHeight: "100vh",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#a78bfa",
                  fontSize: 22, fontFamily: "sans-serif" }}>
      Loading dashboard...
    </div>
  );

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh",
                  fontFamily: "'Inter',sans-serif", padding: "32px 5%" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 28,
                     fontWeight: 800, margin: 0 }}>
          🇮🇪 Ireland Job Market Intelligence
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>
          37,483 real job postings scraped from 11 Irish job boards · October 2022
        </p>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div style={{ display: "flex", gap: 8,
                        flexWrap: "wrap", marginTop: 12 }}>
            {activeFilters.map(f => (
              <span key={f} style={{
                background: "#4f46e5", color: "#fff",
                borderRadius: 20, padding: "4px 14px",
                fontSize: 12, fontWeight: 600
              }}>{f}</span>
            ))}
            <button onClick={() => {
              setSelectedCategory(null); setSelectedCity(null);
            }} style={{
              background: "#ef4444", color: "#fff", border: "none",
              borderRadius: 20, padding: "4px 14px",
              fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>✕ Clear Filters</button>
          </div>
        )}
      </div>

      {/* ── KPI Row ── */}
      <div style={{ display: "flex", gap: 16,
                    flexWrap: "wrap", marginBottom: 28 }}>
        <KPICard label="Total Jobs"
                 value={filtered.length.toLocaleString()}
                 sub={selectedCategory || selectedCity
                       ? "filtered" : "all postings"} />
        <KPICard label="Unique Companies"
                 value={new Set(filtered.map(r=>r.company))
                          .size.toLocaleString()} />
        <KPICard label="Data & Analytics Jobs"
                 value={filtered.filter(r=>
                   r.job_category==="Data & Analytics"
                 ).length} />
        <KPICard label="Job Boards"    value="11" />
        <KPICard label="Cities Covered" value="15+" />
      </div>

      {/* ── Row 1: Categories + Cities ── */}
      <div style={{ display: "grid",
                    gridTemplateColumns: "1fr 1fr", gap: 24,
                    marginBottom: 24 }}>

        {/* Categories — CLICKABLE */}
        <div style={card}>
          <SectionTitle>Jobs by Category</SectionTitle>
          <p style={{ color: "#64748b", fontSize: 12,
                      marginBottom: 12 }}>
            👆 Click a bar to filter the whole dashboard
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={categories
                .filter(r => r.category !== "Other")
                .sort((a,b) => b.job_count - a.job_count)}
              onClick={(e) => {
                if (e?.activePayload?.[0]) {
                  const cat = e.activePayload[0].payload.category;
                  setSelectedCategory(
                    prev => prev === cat ? null : cat
                  );
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray="3 3"
                             stroke="#334155" />
              <XAxis type="number" tick={{ fill: "#94a3b8",
                                           fontSize: 11 }} />
              <YAxis dataKey="category" type="category" width={160}
                     tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: 8, color: "#f1f5f9" }}
              />
              <Bar dataKey="job_count" radius={[0,6,6,0]}>
                {categories
                  .filter(r => r.category !== "Other")
                  .map((entry) => (
                    <Cell key={entry.category}
                      fill={selectedCategory === entry.category
                             ? "#a78bfa" : HIGHLIGHT}
                      opacity={selectedCategory &&
                               selectedCategory !== entry.category
                               ? 0.35 : 1}
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cities — CLICKABLE */}
        <div style={card}>
          <SectionTitle>Jobs by City</SectionTitle>
          <p style={{ color: "#64748b", fontSize: 12,
                      marginBottom: 12 }}>
            👆 Click a bar to filter by city
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={cities.slice(0, 10)}
              onClick={(e) => {
                if (e?.activePayload?.[0]) {
                  const city = e.activePayload[0].payload.city_clean;
                  setSelectedCity(
                    prev => prev === city ? null : city
                  );
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray="3 3"
                             stroke="#334155" />
              <XAxis type="number" tick={{ fill: "#94a3b8",
                                           fontSize: 11 }} />
              <YAxis dataKey="city_clean" type="category" width={100}
                     tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: 8, color: "#f1f5f9" }}
              />
              <Bar dataKey="job_count" radius={[0,6,6,0]}>
                {cities.slice(0,10).map((entry) => (
                  <Cell key={entry.city_clean}
                    fill={selectedCity === entry.city_clean
                           ? "#a78bfa" : "#8b5cf6"}
                    opacity={selectedCity &&
                             selectedCity !== entry.city_clean
                             ? 0.35 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 2: Companies + Seniority (REACTIVE) ── */}
      <div style={{ display: "grid",
                    gridTemplateColumns: "1.5fr 1fr", gap: 24,
                    marginBottom: 24 }}>

        {/* Top Companies — updates when filter applied */}
        <div style={card}>
          <SectionTitle>
            Top Hiring Companies
            {(selectedCategory || selectedCity) &&
              <span style={{ color: "#a78bfa", fontSize: 13,
                             fontWeight: 400, marginLeft: 8 }}>
                (filtered)
              </span>}
          </SectionTitle>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart layout="vertical" data={filteredCompanies}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis type="number"
                     tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis dataKey="company" type="category" width={160}
                     tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: 8, color: "#f1f5f9" }}
              />
              <Bar dataKey="job_count" fill="#6366f1"
                   radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seniority Pie — updates when filter applied */}
        <div style={card}>
          <SectionTitle>
            Seniority Split
            {(selectedCategory || selectedCity) &&
              <span style={{ color:"#a78bfa", fontSize:13,
                             fontWeight:400, marginLeft:8 }}>
                (filtered)
              </span>}
          </SectionTitle>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={filteredSeniority} dataKey="value"
                   nameKey="name" cx="50%" cy="50%"
                   outerRadius={100} innerRadius={50}
                   paddingAngle={3}
                   label={({name,percent}) =>
                     `${name} ${(percent*100).toFixed(0)}%`}>
                {filteredSeniority.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background:"#1e293b",
                                border:"1px solid #334155",
                                borderRadius:8, color:"#f1f5f9" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Job Boards (REACTIVE) ── */}
      <div style={card}>
        <SectionTitle>
          Job Board Market Share
          {(selectedCategory || selectedCity) &&
            <span style={{ color:"#a78bfa", fontSize:13,
                           fontWeight:400, marginLeft:8 }}>
              (filtered)
            </span>}
        </SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={filteredBoards}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="name"
                   tick={{ fill:"#94a3b8", fontSize:11 }} />
            <YAxis tick={{ fill:"#94a3b8", fontSize:11 }} />
            <Tooltip
              contentStyle={{ background:"#1e293b",
                              border:"1px solid #334155",
                              borderRadius:8, color:"#f1f5f9" }}
            />
            <Bar dataKey="value" fill="#7c3aed"
                 radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 4: Data & Analytics Deep Dive ── */}
      <div style={{ marginTop: 8 }}>
        <h2 style={{ color:"#a78bfa", fontSize:22,
                     fontWeight:800, marginBottom:8 }}>
          🔍 Data & Analytics Deep Dive
        </h2>
        <p style={{ color:"#64748b", fontSize:13,
                    marginBottom:20 }}>
          Your target market — 406 roles analysed
        </p>

        <div style={{ display:"grid",
                      gridTemplateColumns:"1fr 1fr",
                      gap:24 }}>

          {/* Top Data Job Titles */}
          <div style={card}>
            <SectionTitle>Most Posted Data Roles</SectionTitle>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical"
                        data={dataTitles.slice(0,12)}>
                <CartesianGrid strokeDasharray="3 3"
                               stroke="#334155"/>
                <XAxis type="number"
                       tick={{ fill:"#94a3b8", fontSize:11 }} />
                <YAxis dataKey="job_title" type="category"
                       width={180}
                       tick={{ fill:"#94a3b8", fontSize:11 }} />
                <Tooltip
                  contentStyle={{ background:"#1e293b",
                                  border:"1px solid #334155",
                                  borderRadius:8,
                                  color:"#f1f5f9" }}
                />
                <Bar dataKey="count" radius={[0,6,6,0]}>
                  {dataTitles.slice(0,12).map((entry,i) => (
                    <Cell key={i}
                      fill={entry.job_title
                              .toLowerCase()
                              .includes("data analyst")
                             ? "#a78bfa" : HIGHLIGHT}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Companies for Data roles */}
          <div style={card}>
            <SectionTitle>Who's Hiring Data People</SectionTitle>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical"
                        data={dataCompanies.slice(0,12)}>
                <CartesianGrid strokeDasharray="3 3"
                               stroke="#334155"/>
                <XAxis type="number"
                       tick={{ fill:"#94a3b8", fontSize:11 }} />
                <YAxis dataKey="company" type="category"
                       width={160}
                       tick={{ fill:"#94a3b8", fontSize:11 }} />
                <Tooltip
                  contentStyle={{ background:"#1e293b",
                                  border:"1px solid #334155",
                                  borderRadius:8,
                                  color:"#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#8b5cf6"
                     radius={[0,6,6,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign:"center", marginTop:48,
                    color:"#475569", fontSize:12 }}>
        Built by Karthika Garikapati · Data Source: Kaggle (Techmap,
        Oct 2022) · Stack: React + Recharts
      </div>
    </div>
  );
}