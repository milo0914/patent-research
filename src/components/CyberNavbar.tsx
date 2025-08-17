import React from 'react';
import { Zap, Upload, History, User, Settings, LogOut, Globe, Menu, X, Atom } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface CyberNavbarProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function CyberNavbar({ onMenuToggle, isMobileMenuOpen }: CyberNavbarProps) {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const navigationItems = [
    { path: '/dashboard', icon: Zap, label: t('nav.dashboard') },
    { path: '/upload', icon: Upload, label: t('nav.upload') },
    { path: '/history', icon: History, label: t('nav.history') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="cyber-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative">
              <Atom className="w-8 h-8 text-cyan-400 group-hover:text-purple-400 transition-colors duration-300" />
              <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold neon-text">
                {t('app.title')}
              </h1>
              <p className="text-xs text-gray-400 font-light">
                {t('app.subtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`cyber-nav-link flex items-center space-x-2 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="cyber-button-secondary flex items-center space-x-2 px-3 py-2 text-sm"
              title={`Switch to ${language === 'zh' ? 'English' : '繁中'}`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">
                {language === 'zh' ? 'EN' : '繁'}
              </span>
            </button>

            {/* User Menu */}
            {user && (
              <div className="relative group">
                <button className="cyber-button-secondary flex items-center space-x-2 px-3 py-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {user.email?.split('@')[0] || 'User'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 cyber-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-cyan-500/10 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{t('nav.profile')}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-red-500/10 transition-colors text-red-400 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="md:hidden cyber-button-secondary p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-500/30 mt-4 pt-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`cyber-nav-link flex items-center space-x-3 py-3 ${
                      isActive ? 'active' : ''
                    }`}
                    onClick={onMenuToggle}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}