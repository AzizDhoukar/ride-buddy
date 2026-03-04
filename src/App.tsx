import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/contexts/AppContext";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Rides from "./pages/Rides";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import PaymentMethods from "./pages/PaymentMethods";
import Earnings from "./pages/Earnings";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useApp();
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" replace /> : <Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/rides" element={<ProtectedRoute><Rides /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
      <Route path="/payment-methods" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />
      <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
