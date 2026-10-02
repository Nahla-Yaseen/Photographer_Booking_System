import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// User Pages
import HomePage from "./pages/user/HomePage";
import LoginPage from "./pages/user/LoginPage";
import Dashboard from "./pages/user/Dashboard";
import BookPhotographer from "./pages/user/BookPhotographer";
import AdditionalServices from "./pages/user/AdditionalServices";
import MyBookings from "./pages/user/MyBookings";
import PaymentPage from "./pages/user/PaymentPage";
import BookingConfirmation from "./pages/user/BookingConfirmation";
import AboutUs from "./pages/user/AboutUs";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePhotographers from "./pages/admin/ManagePhotographers";
import ManageServices from "./pages/admin/ManageServices";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageSlotsAvailability from "./pages/admin/ManageSlotsAvailability";
import ManageReports from "./pages/admin/ManageReports";

// Photographer Pages
import PhotographerLogin from "./pages/photographer/PhotographerLogin";
import PhotographerDashboard from "./pages/photographer/PhotographerDashboard";
import PhotographerBookings from "./pages/photographer/PhotographerBookings";
import PhotographerProfile from "./pages/photographer/PhotographerProfile";
import PhotographerAvailability from "./pages/photographer/PhotographerAvailability";

// User Layout wrapper that renders Navbar and Footer
function UserLayout({ children }) {
  const location = useLocation();
  // Hide footer on book, services, and all login/register pages as requested
  const hideFooter =
    location.pathname.includes("/book") ||
    location.pathname.includes("/services") ||
    location.pathname.includes("/payment") ||
    location.pathname.includes("/login") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/photographer");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Router>
          <Routes>
            {/* User Routes wrapped with UserLayout */}
            <Route
              path="/"
              element={
                <UserLayout>
                  <HomePage />
                </UserLayout>
              }
            />
            <Route
              path="/login"
              element={
                <UserLayout>
                  <LoginPage />
                </UserLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <UserLayout>
                  <Dashboard />
                </UserLayout>
              }
            />
            <Route
              path="/book"
              element={
                <UserLayout>
                  <BookPhotographer />
                </UserLayout>
              }
            />
            <Route
              path="/services"
              element={
                <UserLayout>
                  <AdditionalServices />
                </UserLayout>
              }
            />
            <Route
              path="/payment"
              element={
                <UserLayout>
                  <PaymentPage />
                </UserLayout>
              }
            />
            <Route
              path="/booking-confirmation"
              element={
                <UserLayout>
                  <BookingConfirmation />
                </UserLayout>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <UserLayout>
                  <MyBookings />
                </UserLayout>
              }
            />
            <Route path="/bookings" element={<Navigate to="/my-bookings" replace />} />
            <Route
              path="/about"
              element={
                <UserLayout>
                  <AboutUs />
                </UserLayout>
              }
            />

            {/* Photographer Routes */}
            <Route path="/photographer/login" element={<PhotographerLogin />} />
            <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
            <Route path="/photographer/bookings" element={<PhotographerBookings />} />
            <Route path="/photographer/profile" element={<PhotographerProfile />} />
            <Route path="/photographer/availability" element={<PhotographerAvailability />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/photographers" element={<ManagePhotographers />} />
            <Route path="/admin/services" element={<ManageServices />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
            <Route path="/admin/availability" element={<ManageSlotsAvailability />} />
            <Route path="/admin/reports" element={<ManageReports />} />

            {/* Default fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </BookingProvider>
    </AuthProvider>
  );
}
