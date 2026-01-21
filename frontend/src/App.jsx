import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const LateLoginPage = lazy(() => import("./pages/LateLoginPage"));
const Profile = lazy(() => import("./pages/Profile"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
//import Signup from "./pages/Signup";
import { getDashboardPath } from "./utils/dashboardPath";

//  Dashboards
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const TeamLeadDashboard = lazy(() => import("./pages/Team Lead/TeamLeadDashboard"));

// Team Lead Pages
const TeamManagement = lazy(() => import("./pages/Team Lead/TeamManagement"));
const TeamAttendance = lazy(() => import("./pages/Team Lead/TeamAttendance"));
const TeamPerformance = lazy(() => import("./pages/Team Lead/TeamPerformance"));
const TaskManagement = lazy(() => import("./pages/Team Lead/TaskManagement"));
//import DepartmentReports from "./pages/Team Lead/DepartmentReports";
//import BudgetResources from "./pages/Team Lead/BudgetResources";
//import EmployeeDevelopment from "./pages/Team Lead/EmployeeDevelopment";
const ManagerLeaveRequests = lazy(() => import("./pages/Team Lead/ManagerLeaveRequests"));
const LeadApproval = lazy(() => import("./pages/Team Lead/LeadApproval"));
const ShiftExtensions = lazy(() => import("./pages/Team Lead/ShiftExtensions"));
// import TeamPerformance from "./pages/Team Lead/TeamPerformance";
const PerformanceAnalytics = lazy(() => import("./pages/Team Lead/PerformanceAnalytics"));
const RAGStatus = lazy(() => import("./pages/Team Lead/RAGStatus"));


// Employee Pages
const EmployeeAttendance = lazy(() => import("./pages/employee/Attendance"));
const Payroll = lazy(() => import("./pages/employee/Payroll"));
const Tasks = lazy(() => import("./pages/employee/Tasks"));
const DemoHistory = lazy(() => import("./pages/employee/DemoHistory"));
const MyDesk = lazy(() => import("./pages/employee/MyDesk"));
const Production = lazy(() => import("./pages/employee/Production"));
const Quality = lazy(() => import("./pages/employee/Quality"));
const AHT = lazy(() => import("./pages/employee/AHT"));
const ALB = lazy(() => import("./pages/employee/ALB"));
const WP = lazy(() => import("./pages/employee/WP"));
const LCRM = lazy(() => import("./pages/employee/LCRM"));
// import ITSupport from "./pages/employee/ITSupport"; // commented per request
const HRQuery = lazy(() => import("./pages/employee/HRQuery"));
const AdminQuery = lazy(() => import("./pages/employee/AdminQuery"));
const PayrollLCRM = lazy(() => import("./pages/employee/PayrollLCRM"));
const LeaveRequest = lazy(() => import("./pages/employee/LeaveRequest"));

// HR Pages
const HRDashboard = lazy(() => import("./pages/HR/HRDashboard"));
const Recruitment = lazy(() => import("./pages/HR/Recruitment"));
const HRTasks = lazy(() => import("./pages/HR/HRTasks"));
const HRLeaveRequests = lazy(() => import("./pages/HR/HRLeaveRequests"));
const HRMyDesk = lazy(() => import("./pages/HR/HRMyDesk"));
const HRLCRM = lazy(() => import("./pages/HR/HRLCRM"));
const HRSolveQueries = lazy(() => import("./pages/HR/HRSolveQueries"));
const HRBPPerformanceAnalytics = lazy(() => import("./pages/HR/HRBPPerformanceAnalytics"));
const HRBPReports = lazy(() => import("./pages/HR/HRBPReports"));
const HRBPAttendance = lazy(() => import("./pages/HR/HRBPAttendance"));
const HRBPLeaveManagement = lazy(() => import("./pages/HR/HRBPLeaveManagement"));
const HRBPPayrollReports = lazy(() => import("./pages/HR/HRBPPayrollReports"));
const HRBPStatutoryReturns = lazy(() => import("./pages/HR/HRBPStatutoryReturns"));
const HRBPExceptionsDiscipline = lazy(() => import("./pages/HR/HRBPExceptionsDiscipline"));
const HRBPAssetManagement = lazy(() => import("./pages/HR/HRBPAssetManagement"));
const HRBPExitFullFinal = lazy(() => import("./pages/HR/HRBPExitFullFinal"));
const CoreHR = lazy(() => import("./pages/HR/CoreHR"));
const EmployeeView = lazy(() => import("./pages/HR/EmployeeView"));
const HRBPDemographics = lazy(() => import("./pages/HR/HRBPDemographics"));
const HRBPMovement = lazy(() => import("./pages/HR/HRBPMovement"));
const HRBPFinancial = lazy(() => import("./pages/HR/HRBPFinancial"));
const HRBPAbsence = lazy(() => import("./pages/HR/HRBPAbsence"));
const HRBPAnalysis = lazy(() => import("./pages/HR/HRBPAnalysis"));
const HRBPReport = lazy(() => import("./pages/HR/HRBPReport"));
const TeamLeadReport = lazy(() => import("./pages/HR/LeadReport"));
const Recruitmentreport = lazy(() => import("./pages/HR/Recruitmentreport"));


// Admin Pages
//import ManageUsers from "./pages/admin/ManageUsers";
const AdminAttendance = lazy(() => import("./pages/admin/Attendance"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const TeamLeadReports = lazy(() => import("./pages/admin/TeamLeadReports"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const LeaveRequests = lazy(() => import("./pages/admin/LeaveRequests"));
const HRReports = lazy(() => import("./pages/admin/HRReports"));
const AdminTaskManagement = lazy(() => import("./pages/admin/TaskManagement"));
const AdminTeamManagement = lazy(() => import("./pages/admin/TeamManagement"));
const AdminQueries = lazy(() => import("./pages/admin/AdminQueries"));
const AdminPerformanceAnalytics = lazy(() => import("./pages/admin/PerformanceAnalytics"));
const AdminPayroll = lazy(() => import("./pages/admin/Payroll"));
const AdminLeaveHistory = lazy(() => import("./pages/admin/LeaveHistory"));
const Policies = lazy(() => import("./pages/Policies"));
const Updates = lazy(() => import("./pages/Updates"));


// Forgot Password
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

// Notifications (provider only)
import { NotificationProvider } from "./context/NotificationContext";

//  Auth
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
 

//  Wrapper for public pages (login, signup, forgot-password)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();

  if (currentUser) {
    // Redirect to appropriate dashboard after login
    const target = getDashboardPath(currentUser);
    return <Navigate to={target} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          {/* notification bell  */}
          <Navbar />
          

          <Suspense fallback={null}>
          <Routes>
            {/* Home protected: require login */}
                        
            <Route 
            path="/late-login" 
            element={
            <LateLoginPage />
            } 
            />


            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />

            {/* HR Dashboard + Subpages */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Navigate to="/" replace />
                </PrivateRoute>
              }
            />

            {/* Backward-compatible redirects from role-specific dashboards */}
            <Route
              path="/hr/dashboard"
              element={
                <PrivateRoute>
                  <Navigate to="/" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/recruitment"
              element={
                <PrivateRoute role="hr">
                  <Recruitment />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/tasks"
              element={
                <PrivateRoute role="hr">
                  <HRTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/leave-requests"
              element={
                <PrivateRoute role="hr">
                  <HRLeaveRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/mydesk"
              element={
                <PrivateRoute role="hr">
                  <HRMyDesk />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/lcrm"
              element={
                <PrivateRoute role="hr">
                  <HRLCRM />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/solve-queries"
              element={
                <PrivateRoute role="hr">
                  <HRSolveQueries />
                </PrivateRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            {/* <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            /> */}
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />

            {/*  Profile routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/setup"
              element={
                <PrivateRoute role="employee">
                  <ProfileSetup />
                </PrivateRoute>
              }
            />

            {/* Employee Dashboard + Subpages */}
            <Route
              path="/employee/dashboard"
              element={
                <PrivateRoute>
                  <Navigate to="/" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/attendance"
              element={
                <PrivateRoute role="employee">
                  <EmployeeAttendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/payroll"
              element={
                <PrivateRoute role="employee">
                  <Payroll />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/tasks"
              element={
                <PrivateRoute role="employee">
                  <Tasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/demo-history"
              element={
                <PrivateRoute role="employee">
                  <DemoHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk"
              element={
                <PrivateRoute role="employee">
                  <MyDesk />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk/production"
              element={
                <PrivateRoute role="employee">
                  <Production />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk/quality"
              element={
                <PrivateRoute role="employee">
                  <Quality />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk/aht"
              element={
                <PrivateRoute role="employee">
                  <AHT />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk/alb"
              element={
                <PrivateRoute role="employee">
                  <ALB />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/mydesk/wp"
              element={
                <PrivateRoute role="employee">
                  <WP />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/lcrm"
              element={
                <PrivateRoute role="employee">
                  <LCRM />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/lcrm"
              element={
                <PrivateRoute role="teamlead">
                  <LCRM />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/lcrm/hr-query"
              element={
                <PrivateRoute role="teamlead">
                  <HRQuery />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/lcrm/admin-query"
              element={
                <PrivateRoute role="teamlead">
                  <AdminQuery />
                </PrivateRoute>
              }
            />
            {/** IT Support page commented per request; mailto is used from LCRM **/}
            {/**
            <Route
              path="/employee/lcrm/it-support"
              element={
                <PrivateRoute role="employee">
                  <ITSupport />
                </PrivateRoute>
              }
            />
            **/}
            <Route
              path="/employee/lcrm/hr-query"
              element={
                <PrivateRoute role="employee">
                  <HRQuery />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/lcrm/admin-query"
              element={
                <PrivateRoute role="employee">
                  <AdminQuery />
                </PrivateRoute>
              }
            />
            <Route
              path="/hr/lcrm/admin-query"
              element={
                <PrivateRoute role="hr">
                  <AdminQuery />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/lcrm/payroll"
              element={
                <PrivateRoute role="employee">
                  <PayrollLCRM />
                </PrivateRoute>
              }
            />

            <Route
              path="/hr/lcrm/payroll"
              element={
                <PrivateRoute role="hr">
                  <PayrollLCRM />
                </PrivateRoute>
              }
            />
            <Route
              path="/leave-request"
              element={
                <PrivateRoute>
                  <LeaveRequest />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee/leave-request"
              element={
                <PrivateRoute role="employee">
                  <LeaveRequest />
                </PrivateRoute>
              }
            />

            {/* Shared Policies page accessible to all authenticated users */}
            <Route
              path="/policies"
              element={
                <PrivateRoute>
                  <Policies />
                </PrivateRoute>
              }
            />

            <Route
              path="/updates"
              element={
                <PrivateRoute role="hr">
                  <Updates />
                </PrivateRoute>
              }
            />

            {/* Team Lead Dashboard + Subpages */}
            <Route
              path="/teamlead/dashboard"
              element={
                <PrivateRoute>
                  <Navigate to="/" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/team"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead", "hrbp"]}>
                  <TeamManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/attendance"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead","hrbp"]}>
                  <TeamAttendance />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/performance"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead", "hrbp"]}>
                  <TeamPerformance />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/performance/analytics"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPPerformanceAnalytics />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/analysis"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPAnalysis />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPReports />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/attendance"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPAttendance />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/leave"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPLeaveManagement />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/payroll"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPPayrollReports />
                </PrivateRoute>
              }
            />

            <Route 
              path="/hrbp/report"
              element={
                <PrivateRoute 
                designations={["hrbp", "hrbp lead"]}>
                  <HRBPReport />
                  </PrivateRoute>
                }
                />

            <Route
              path="/hrbp/reports/recruitment"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <Recruitmentreport />
                </PrivateRoute>
              }
            />

            <Route
              path="/HR/hr-reports"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <Recruitmentreport />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/lead"
                element={
                  <PrivateRoute 
                  designations={["hrbp", "hrbp lead"]}>
                    <TeamLeadReport />
                  </PrivateRoute>
                }
            />

            <Route
              path="/HR/team-lead-reports"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <TeamLeadReport />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/statutory"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPStatutoryReturns />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/exceptions"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPExceptionsDiscipline />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/assets"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPAssetManagement />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/exit"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPExitFullFinal />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/corehr"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <CoreHR />
                </PrivateRoute>
              }
            />

            <Route
              path="/hrbp/reports/corehr/employee/:employeeCode"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <EmployeeView />
                </PrivateRoute>
              }
            />
            <Route
              path="/hrbp/reports/demographics"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPDemographics />
                </PrivateRoute>
              }
            />
            <Route
              path="/hrbp/reports/movement"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPMovement />
                </PrivateRoute>
              }
            />
            <Route
              path="/hrbp/reports/financial"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPFinancial />
                </PrivateRoute>
              }
            />
            <Route
              path="/hrbp/reports/absence"
              element={
                <PrivateRoute designations={["hrbp", "hrbp lead"]}>
                  <HRBPAbsence />
                </PrivateRoute>
              }
            />

            <Route
              path="/teamlead/tasks"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead","hrbp"]}>
                  <TaskManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/my-tasks"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead", "hrbp"]}>
                  <Tasks />
                </PrivateRoute>
              }
            />
            
            {/* <Route
              path="/teamlead/budget"
              element={
                <PrivateRoute role="teamlead">
                  <BudgetResources />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/development"
              element={
                <PrivateRoute role="teamlead">
                  <EmployeeDevelopment />
                </PrivateRoute>
              } 
            />*/}
            {/* Redirect old /rag route to the new performance tab */}
            <Route
              path="/teamlead/rag"
              element={
                <PrivateRoute role="teamlead">
                  <Navigate to="/teamlead/performance?tab=connections" replace />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/performance"
              element={
                <PrivateRoute role="teamlead">
                  <TeamPerformance />
                </PrivateRoute>
              }
/>
            <Route
              path="/teamlead/leave-requests"
              element={
                <PrivateRoute role="teamlead">
                  <ManagerLeaveRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/performance/analytics"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead", "hrbp"]}>
                  <PerformanceAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/connections"
              element={
                <PrivateRoute role="teamlead">
                  <RAGStatus />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/shift-extensions"
              element={
                <PrivateRoute role="teamlead">
                  <ShiftExtensions />
                </PrivateRoute>
              }
            />
            <Route
              path="/teamlead/lead-approval"
              element={
                <PrivateRoute designations={["team lead", "team leader", "tl", "hrbp lead","hrbp"]}>
                  <LeadApproval />
                </PrivateRoute>
              }
            />
            {/* Admin Dashboard + Subpages */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <PrivateRoute role="admin">
                  <AdminAttendance />
                </PrivateRoute>
              }
            />
            {/* <Route
              path="/admin/users"
              element={
                <PrivateRoute role="admin">
                  <ManageUsers />
                </PrivateRoute>
              }
            /> */}
            <Route
              path="/admin/analytics"
              element={
                <PrivateRoute role="admin">
                  <Analytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/performance-analytics"
              element={
                <PrivateRoute role="admin">
                  <AdminPerformanceAnalytics />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute role="admin">
                  <Reports />
                </PrivateRoute>
              }
              />
            <Route
              path="/admin/payroll"
              element={
                <PrivateRoute role="admin">
                  <AdminPayroll />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/team-lead-reports"
              element={
                <PrivateRoute role="admin">
                  <TeamLeadReports />
                </PrivateRoute>
              }
            />
              <Route
              path="/admin/hr-reports"
              element={
                <PrivateRoute role="admin">
                  <HRReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <PrivateRoute role="admin">
                  <Settings />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/leave-requests"
              element={
                <PrivateRoute role="admin">
                  <LeaveRequests />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/leave-history"
              element={
                <PrivateRoute role="admin">
                  <AdminLeaveHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/queries"
              element={
                <PrivateRoute role="admin">
                  <AdminQueries />
                </PrivateRoute>
              }
            />

            {/* Admin routes for Manager Components */}
            <Route
              path="/admin/team-management"
              element={
                <PrivateRoute role="admin">
                  <AdminTeamManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/team-attendance"
              element={
                <PrivateRoute role="admin">
                  <TeamAttendance />
                </PrivateRoute>
              }
            />
            {/* Removed Admin Performance Analytics route per request */}
            <Route
              path="/admin/task-management"
              element={
                <PrivateRoute role="admin">
                  <AdminTaskManagement />
                </PrivateRoute>
              }
            />
           {/*<Route
              path="/admin/department-reports"
              element={
                <PrivateRoute role="admin">
                  <DepartmentReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/budget-resources"
              element={
                <PrivateRoute role="admin">
                  <BudgetResources />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/employee-development"
              element={
                <PrivateRoute role="admin">
                  <EmployeeDevelopment />
                </PrivateRoute>
              } 
            />*/}

            {/*  Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
