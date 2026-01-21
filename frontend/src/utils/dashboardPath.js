// src/utils/dashboardPath.js
// Returns the dashboard path based on designation first, then falls back to role

export function getEffectiveRole(user = {}) {
  const rawDesig = (user.designation || user.position || "").toString();
  const designation = rawDesig.trim().replace(/\s+/g, " ").toLowerCase();
  const rawRole = (user.role || "").toString();
  const role = rawRole.trim().toLowerCase();
  const roleCompact = role.replace(/\s+/g, "");

  const isOneOf = (val, arr) => arr.map(s => s.toLowerCase()).includes(val);

  if (designation) {
    if (isOneOf(designation, ["project manager"])) return "admin";
    if (isOneOf(designation, ["team lead", "team leader", "tl"])) return "teamlead";
    // HR family: include common variants
    if (
      designation === "hr" ||
      designation.includes("hr executive") ||
      designation.includes("hr manager") ||
      designation.includes("it recruiter") ||
      designation.includes("hrbp")
    ) return "hr";
    if (isOneOf(designation, ["process associate", "senior process associate", "developer", "java developer"])) return "employee";
  }
  // fallback to role (also map common variants)
  if (roleCompact === "teamlead" || isOneOf(role, ["team lead", "team leader", "tl"])) return "teamlead";
  if (role === "hr" || role.includes("hr")) return "hr";
  if (role === "admin" || role.includes("project manager")) return "admin";
  return role || "employee";
}

export function getDashboardPath(user = {}) {
  // Admins should continue to use the existing Admin dashboard
  const eff = (getEffectiveRole(user) || "").toLowerCase();
  if (eff === "admin") return "/admin/dashboard";
  // Everyone else goes to Home (Unified dashboard removed)
  return "/";
}
