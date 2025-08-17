import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Zap, Clock, TrendingUp, Activity, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, Analysis } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface DashboardStats {
  totalAnalyses: number;
  completedAnalyses: number;
  processingAnalyses: number;
  failedAnalyses: number;
  totalChemicalEntities: number;
  totalSmilesStructures: number;
}

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    completedAnalyses: 0,
    processingAnalyses: 0,
    failedAnalyses: 0,
    totalChemicalEntities: 0,
    totalSmilesStructures: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取用户分析记录
      const { data, error } = await supabase.functions.invoke('user-analyses', {
        method: 'GET'
      });
      
      if (error) {
        throw error;
      }
      
      const analyses = data.data.analyses || [];
      setRecentAnalyses(analyses.slice(0, 5)); // 只显示最近5条
      
      // 计算统计数据
      const stats: DashboardStats = {
        totalAnalyses: analyses.length,
        completedAnalyses: analyses.filter((a: Analysis) => a.status === 'completed').length,
        processingAnalyses: analyses.filter((a: Analysis) => a.status === 'processing').length,
        failedAnalyses: analyses.filter((a: Analysis) => a.status === 'failed').length,
        totalChemicalEntities: analyses.reduce((sum: number, a: Analysis) => 
          sum + (a.statistics?.chemical_entities_count || 0), 0),
        totalSmilesStructures: analyses.reduce((sum: number, a: Analysis) => 
          sum + (a.statistics?.smiles_structures_count || 0), 0)
      };
      
      setStats(stats);
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'processing': return 'status-processing';
      case 'failed': return 'status-failed';
      default: return 'status-processing';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MM-dd HH:mm', {
      locale: language === 'zh' ? zhCN : enUS
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 歡迎標語 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-text mb-2">
            歡迎回來，{profile?.display_name || user?.email?.split('@')[0] || '使用者'}
          </h1>
          <p className="text-xl text-gray-300">
            這裡是您的專利分析儀表板，檢視您的分析數據和統計資訊
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">總分析數</p>
                <p className="text-3xl font-bold text-white">{stats.totalAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">成功完成</p>
                <p className="text-3xl font-bold text-green-400">{stats.completedAnalyses}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">化學實體</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalChemicalEntities}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">SMILES結構</p>
                <p className="text-3xl font-bold text-pink-400">{stats.totalSmilesStructures}</p>
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 最近分析 */}
          <div className="lg:col-span-2">
            <div className="cyber-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold neon-text-purple">最近的分析</h2>
                <Link to="/history" className="cyber-button-secondary px-4 py-2 text-sm">
                  檢視全部
                </Link>
              </div>
              
              {recentAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">暫無分析記錄</p>
                  <p className="text-gray-500 mb-6">上傳您的PDF專利文檔開始分析</p>
                  <Link to="/upload" className="cyber-button">
                    立即上傳
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white truncate">{analysis.file_name}</h3>
                        <span className={getStatusBadge(analysis.status)}>
                          {t(`analysis.status.${analysis.status}`)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Activity className="w-4 h-4" />
                            <span>{analysis.statistics?.chemical_entities_count || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Zap className="w-4 h-4" />
                            <span>{analysis.statistics?.smiles_structures_count || 0}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(analysis.created_at)}</span>
                        </div>
                      </div>
                      
                      {analysis.status === 'completed' && (
                        <div className="mt-3">
                          <Link 
                            to={`/analysis/${analysis.id}`}
                            className="cyber-button-secondary px-3 py-1 text-xs"
                          >
                            檢視結果
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 快速操作 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">快速操作</h3>
              <div className="space-y-3">
                <Link to="/upload" className="cyber-button w-full py-3 text-center block">
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>上傳新文檔</span>
                  </div>
                </Link>
                
                <Link to="/history" className="cyber-button-secondary w-full py-3 text-center block">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>歷史記錄</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* 系統狀態 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">系統狀態</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">處理中</span>
                  <span className="text-yellow-400 font-medium">{stats.processingAnalyses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">已完成</span>
                  <span className="text-green-400 font-medium">{stats.completedAnalyses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">失敗</span>
                  <span className="text-red-400 font-medium">{stats.failedAnalyses}</span>
                </div>
              </div>
            </div>

            {/* 使用者資訊 */}
            <div className="cyber-card">
              <h3 className="text-xl font-bold neon-text mb-4">使用者資訊</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium">{profile?.display_name || '未設定'}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <Link to="/profile" className="cyber-button-secondary w-full py-2 text-center block text-sm">
                    管理帳戶
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}