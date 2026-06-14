import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import NewAppLayout from '@/components/new-layout';
import LoginPage from '@/pages/new-login';
import RegisterPage from '@/pages/new-register';
import NewDashboardPage from '@/pages/new-dashboard';
import NewInventoryPage from '@/pages/new-inventory';
import NewItemDetailPage from '@/pages/new-item-detail';
import NewShoppingPage from '@/pages/new-shopping';
import NewHouseholdPage from '@/pages/new-household';
import NewNotificationsPage from '@/pages/new-notifications';
import NewAIChatPage from '@/pages/new-ai-chat';
import AddItemPage from '@/pages/add-item';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-muted-foreground">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <NewAppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewDashboardPage />} />
            <Route path="inventory" element={<NewInventoryPage />} />
            <Route path="inventory/:itemId" element={<NewItemDetailPage />} />
            <Route path="shopping" element={<NewShoppingPage />} />
            <Route path="household" element={<NewHouseholdPage />} />
            <Route path="notifications" element={<NewNotificationsPage />} />
            <Route path="ai-chat" element={<NewAIChatPage />} />
            <Route path="add" element={<AddItemPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
