import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CyberNavbar } from '@/components/CyberNavbar';
import { ToastContainer } from '@/components/CyberToast';
import { useAuth } from '@/contexts/AuthContext';

// 页面组件
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { UploadPage } from '@/pages/UploadPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AnalysisDetailPage } from '@/pages/AnalysisDetailPage';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';

// 私有路由组件
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

// 主布局组件
function MainLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CyberNavbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <main className="pt-16">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
}

// 主应用组件
function AppContent() {
  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        {/* 私有路由 */}
        <Route path="/" element={
          <PrivateRoute>
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/upload" element={
          <PrivateRoute>
            <MainLayout>
              <UploadPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/history" element={
          <PrivateRoute>
            <MainLayout>
              <HistoryPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        <Route path="/analysis/:id" element={
          <PrivateRoute>
            <MainLayout>
              <AnalysisDetailPage />
            </MainLayout>
          </PrivateRoute>
        } />
        
        {/* 404页面 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <h1 className="text-6xl font-bold neon-text mb-4">404</h1>
              <p className="text-xl text-gray-400 mb-8">页面未找到</p>
              <a href="/dashboard" className="cyber-button">返回仪表板</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

// 根组件
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;