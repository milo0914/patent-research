import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Atom } from 'lucide-react';

export function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // 获取URL中的hash参数
      const hashFragment = window.location.hash;
      
      if (hashFragment && hashFragment.length > 0) {
        // 使用Supabase处理认证回调
        const { data, error } = await supabase.auth.exchangeCodeForSession(hashFragment);
        
        if (error) {
          console.error('认证回调错误:', error.message);
          navigate('/login?error=' + encodeURIComponent(error.message));
          return;
        }
        
        if (data.session) {
          console.log('认证成功，跳转到仪表板');
          navigate('/dashboard');
          return;
        }
      }
      
      // 如果没有找到session，跳转到登录页面
      navigate('/login?error=No session found');
    } catch (error) {
      console.error('认证回调处理失败:', error);
      navigate('/login?error=' + encodeURIComponent('认证失败，请重试'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Atom className="w-16 h-16 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-xl animate-pulse"></div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold neon-text mb-4">
          正在处理登录...
        </h1>
        
        <p className="text-gray-400">
          请稍候，我们正在验证您的身份
        </p>
        
        <div className="mt-8">
          <div className="cyber-progress max-w-md mx-auto">
            <div className="cyber-progress-bar" style={{ width: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}