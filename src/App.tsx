import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Upload from "./pages/Upload";
import Review from "./pages/Review";
import ReminderDetail from "./pages/ReminderDetail";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import OfflineBanner from "./components/OfflineBanner";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <OfflineBanner />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/app" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/upload" element={<AuthGuard><Upload /></AuthGuard>} />
          <Route path="/review" element={<AuthGuard><Review /></AuthGuard>} />
          <Route path="/reminder/:id" element={<AuthGuard><ReminderDetail /></AuthGuard>} />
          <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
