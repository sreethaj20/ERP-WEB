    import React from "react";
    import { useNavigate } from "react-router-dom";
    import "../../App.css";

    export default function HRBPAnalysis() {
    const navigate = useNavigate();

    const statCard = (bg) => ({
        background: bg,
        border: "1px solid rgba(15,23,42,0.10)",
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gap: 6,
        minHeight: 86,
    });

    const donut = (percent, colors) => ({
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: `conic-gradient(${colors[0]} ${percent * 3.6}deg, ${colors[1]} 0deg)`,
        display: "grid",
        placeItems: "center",
        position: "relative",
    });

    const donut3 = (segments) => {
        const list = Array.isArray(segments) ? segments : [];
        const safe = list
            .map((s) => ({
                value: Math.max(0, Number(s?.value) || 0),
                color: String(s?.color || "#e2e8f0"),
            }))
            .filter((s) => s.value > 0);

        const total = safe.reduce((sum, s) => sum + s.value, 0) || 1;
        let acc = 0;
        const parts = safe.map((s) => {
            const start = acc;
            acc += (s.value / total) * 360;
            return `${s.color} ${start}deg ${acc}deg`;
        });

        return {
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: `conic-gradient(${parts.join(",")})`,
            display: "grid",
            placeItems: "center",
            position: "relative",
        };
    };

    const donutInner = {
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
        color: "#0f172a",
    };

    return (
        <div className="dashboard fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>HRBP Analysis</div>
            <div style={{ color: "#64748b" }}>Overview of key HRBP indicators and response trends.</div>
            </div>
            <button className="btn-outline" onClick={() => navigate(-1)}>
            Back
            </button>
        </div>

        <div
            className="dashboard-grid"
            style={{
            marginTop: 12,
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            alignItems: "stretch",
            }}
        >
            <div className="dashboard-card" style={statCard("rgba(244, 238, 135, 1)")}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Employees</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>30</div>
            </div>
            <div className="dashboard-card" style={statCard("rgba(141, 242, 130, 1)")}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Total Project</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>05</div>
            </div>
            <div className="dashboard-card" style={statCard("rgba(81, 217, 208, 0.54)")}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Total Leave</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>21</div>
            </div>
            <div className="dashboard-card" style={statCard("rgba(185, 149, 87, 0.55)")}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Total Salary</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#0f172a" }}>1,24,000</div>
            </div>
        </div>

        <div
            style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: 12,
            alignItems: "start",
            }}
        >
            <div className="dashboard-card" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>Project Summary</div>
            <div
                style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.7fr 0.6fr",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(24, 183, 170, 0.55)",
                fontWeight: 900,
                color: "#0f172a",
                }}
            >
                <div>Project</div>
                <div>Date</div>
                <div>Status</div>
            </div>

            {[
                { p: "Onboarding roadmap", d: "1 Jan 2026", s: "Active" },
                { p: "Benefits refresh", d: "2 Jan 2026", s: "Pending" },
                { p: "Engagement survey", d: "31 Dec 2025", s: "Done" },
                { p: "Workforce planning", d: "20 Oct 2025", s: "Done" },
                { p: "Exit review", d: "21 Oct 2025", s: "Active" },
            ].map((row) => (
                <div
                key={row.p}
                style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.7fr 0.6fr",
                    gap: 10,
                    padding: "10px 12px",
                    borderBottom: "1px solid rgba(15,23,42,0.06)",
                    color: "#334155",
                }}
                >
                <div style={{ fontWeight: 750, color: "#0f172a" }}>{row.p}</div>
                <div>{row.d}</div>
                <div style={{ fontWeight: 800, color: row.s === "Done" ? "#16a34a" : row.s === "Active" ? "#2563eb" : "#f40202ff" }}>{row.s}</div>
                </div>
            ))}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
            <div className="dashboard-card" style={{ padding: 14, borderRadius: 14 }}>
                <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>Performance</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                    <div style={{ fontWeight: 800, color: "#334155" }}>Attendance</div>
                    <div style={donut(80, ["#46a944ff", "#d13d3dff"])}>
                    <div style={donutInner}>80%</div>
                    </div>
                </div>
                <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                    <div style={{ fontWeight: 800, color: "#334155" }}>Employee</div>
                    <div style={donut(100, ["#587bc7ff", "#dbeafe"])}>
                    <div style={donutInner}>100%</div>
                    </div>
                </div>
                </div>
            </div>

            <div className="dashboard-card" style={{ padding: 14, borderRadius: 14 }}>
                <div style={{ fontWeight: 900, color: "#0f172a", marginBottom: 10 }}>Application Response</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
                <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                    <div
                    style={donut3([
                        { value: 35, color: "#d5a552ff" },
                        { value: 40, color: "#2563eb" },
                        { value: 25, color: "#64748b" },
                    ])}
                    >
                    <div style={donutInner}>40%</div>
                    </div>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                    {[ 
                    { label: "Shortlisted", value: 35, color: "#d5a552ff" },
                    { label: "Accepted", value: 40, color: "#2563eb" },
                    { label: "Rejected", value: 25, color: "#64748b" },
                    ].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 5, color: "#0f172a", fontWeight: 800 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 999, background: l.color }} />
                        <div style={{ color: "#475569ff", fontWeight: 900 }}>{l.value}%</div>
                        </div>
                        <div>{l.label}</div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    }
