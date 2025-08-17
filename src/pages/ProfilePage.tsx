import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Bell, Save, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/CyberToast';
import { UserProfile } from '@/lib/supabase';

export function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { success, error: showError } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    language_preference: 'zh' as 'zh' | 'en',
    email_notifications: true
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        language_preference: profile.language_preference || 'zh',
        email_notifications: profile.email_notifications ?? true
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const updates: Partial<UserProfile> = {
        display_name: formData.display_name,
        language_preference: formData.language_preference,
        email_notifications: formData.email_notifications
      };
      
      const result = await updateProfile(updates);
      
      if (result) {
        // 同时更新语言设置
        if (formData.language_preference !== language) {
          setLanguage(formData.language_preference);
        }
        
        setEditing(false);
        success(t('settings.updateSuccess'), '您的资料已成功更新');
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('更新用户资料失败:', error);
      showError(t('settings.updateError'), '请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        language_preference: profile.language_preference || 'zh',
        email_notifications: profile.email_notifications ?? true
      });
    }
    setEditing(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-text mb-4">
            {t('settings.title')}
          </h1>
          <p className="text-xl text-gray-300">
            管理您的个人信息和偏好设置
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主要设置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人资料 */}
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold neon-text-purple">
                  {t('settings.profile')}
                </h2>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="cyber-button-secondary flex items-center space-x-2 px-4 py-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t('common.edit')}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCancel}
                      className="cyber-button-secondary px-4 py-2 text-sm"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="cyber-button flex items-center space-x-2 px-4 py-2"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{t('common.save')}</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {/* 邮箱（只读） */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="cyber-input pl-12"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    邮箱地址无法修改
                  </p>
                </div>
                
                {/* 显示名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('settings.displayName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      className="cyber-input pl-12"
                      placeholder="请输入您的显示名称"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 语言设置 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">
                {t('settings.language')}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  界面语言
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.language_preference}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      language_preference: e.target.value as 'zh' | 'en' 
                    })}
                    className="cyber-input pl-12"
                    disabled={!editing}
                  >
                    <option value="zh">{t('settings.languageZh')}</option>
                    <option value="en">{t('settings.languageEn')}</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* 通知设置 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">
                {t('settings.notifications')}
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="font-medium text-white">{t('settings.emailNotifications')}</p>
                      <p className="text-sm text-gray-400">
                        接收分析完成和重要更新的邮件通知
                      </p>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.email_notifications}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        email_notifications: e.target.checked 
                      })}
                      className="sr-only peer"
                      disabled={!editing}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 账户信息 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">账户信息</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="font-semibold text-white">
                    {formData.display_name || user?.email?.split('@')[0] || '用户'}
                  </h4>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">账户创建时间</span>
                    <span className="text-white">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString('zh-CN')
                        : '-'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">最后登录</span>
                    <span className="text-white">
                      {user?.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString('zh-CN')
                        : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 快速操作 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">快速操作</h3>
              
              <div className="space-y-3">
                <button className="cyber-button-secondary w-full py-2 text-sm">
                  修改密码
                </button>
                
                <button className="cyber-button-secondary w-full py-2 text-sm">
                  下载数据
                </button>
                
                <button className="cyber-button-secondary w-full py-2 text-sm text-red-400 border-red-500/30 hover:bg-red-500/10">
                  删除账户
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}