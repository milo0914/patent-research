import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Atom, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/CyberToast';
import { useNavigate, Link } from 'react-router-dom';

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showError(t('auth.loginError'), '请填写所有必需字段');
      return;
    }
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      showError(t('auth.registerError'), t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          throw error;
        }
        success(t('auth.loginSuccess'));
        navigate('/dashboard');
      } else {
        const { error } = await signUp(formData.email, formData.password);
        if (error) {
          throw error;
        }
        success(t('auth.registerSuccess'));
        setIsLogin(true); // 注册成功后切换到登录模式
      }
    } catch (error: any) {
      console.error('认证错误:', error);
      showError(
        isLogin ? t('auth.loginError') : t('auth.registerError'),
        error.message || '请检查您的凭据并重试'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* 语言切换 */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLanguage}
            className="cyber-button-secondary flex items-center space-x-2 px-4 py-2 text-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{language === 'zh' ? 'EN' : '中'}</span>
          </button>
        </div>

        {/* 登录卡片 */}
        <div className="cyber-card">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Atom className="w-16 h-16 text-cyan-400 animate-float" />
                <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold neon-text mb-2">
              {t('app.title')}
            </h1>
            <p className="text-gray-400 text-sm">
              {t('app.subtitle')}
            </p>
          </div>

          {/* 切换按钮 */}
          <div className="flex rounded-lg bg-black/30 p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 text-sm font-medium ${
                isLogin 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 text-sm font-medium ${
                !isLogin 
                  ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 邮箱 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="cyber-input pl-12"
                  placeholder={t('auth.email')}
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="cyber-input pl-12 pr-12"
                  placeholder={t('auth.password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 确认密码 (仅注册时显示) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="cyber-input pl-12"
                    placeholder={t('auth.confirmPassword')}
                    required
                  />
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full cyber-button py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>{t('common.loading')}</span>
                </div>
              ) : (
                isLogin ? t('auth.login') : t('auth.register')
              )}
            </button>
          </form>

          {/* 底部链接 */}
          <div className="text-center mt-6">
            {isLogin ? (
              <p className="text-gray-400">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  {t('auth.register')}
                </button>
              </p>
            ) : (
              <p className="text-gray-400">
                {t('auth.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  {t('auth.login')}
                </button>
              </p>
            )}
          </div>
        </div>
        
        {/* 版权信息 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>由 MiniMax Agent 开发 | 支持国际用户访问</p>
        </div>
      </div>
    </div>
  );
}