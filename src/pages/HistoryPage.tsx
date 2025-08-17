import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Calendar, FileText, Activity, Zap, Eye, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, Analysis, PaginationInfo } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

type StatusFilter = 'all' | 'processing' | 'completed' | 'failed';

export function HistoryPage() {
  const { language, t } = useLanguage();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total_count: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  useEffect(() => {
    loadAnalyses();
  }, [pagination.page, statusFilter]);

  const loadAnalyses = async () => {
    try {
      if (pagination.page === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const { data, error } = await supabase.functions.invoke(`user-analyses?${params}`, {
        method: 'GET'
      });
      
      if (error) {
        throw error;
      }
      
      setAnalyses(data.data.analyses || []);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('加载分析记录失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyses();
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const filteredAnalyses = analyses.filter(analysis => 
    analysis.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    return format(date, 'yyyy-MM-dd HH:mm', {
      locale: language === 'zh' ? zhCN : enUS
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold neon-text mb-4">
            {t('history.title')}
          </h1>
          <p className="text-xl text-gray-300">
            查看和管理您的所有PDF分析记录
          </p>
        </div>

        {/* 搜索和筛选栏 */}
        <div className="cyber-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cyber-input pl-12 w-full"
                placeholder="搜索文件名..."
              />
            </div>
            
            {/* 状态筛选 */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="cyber-input py-2 px-3"
              >
                <option value="all">全部状态</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
            </div>
            
            {/* 刷新按钮 */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="cyber-button-secondary p-3"
              title="刷新"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 分析记录列表 */}
        <div className="cyber-card">
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">
                {searchTerm ? '未找到匹配的记录' : t('history.empty')}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchTerm 
                  ? '请尝试修改搜索关键词或筛选条件'
                  : '上传您的第一个PDF专利文档开始分析'
                }
              </p>
              {!searchTerm && (
                <Link to="/upload" className="cyber-button">
                  立即上传
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* 表格头部 */}
              <div className="overflow-x-auto">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>{t('history.fileName')}</th>
                      <th>文件大小</th>
                      <th>{t('history.status')}</th>
                      <th>{t('history.entities')}</th>
                      <th>{t('history.structures')}</th>
                      <th>{t('history.createdAt')}</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnalyses.map((analysis) => (
                      <tr key={analysis.id}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="font-medium text-white truncate max-w-xs">
                                {analysis.file_name}
                              </p>
                              {analysis.processing_time && (
                                <p className="text-xs text-gray-400">
                                  处理时间: {analysis.processing_time}秒
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="text-gray-400">
                          {analysis.file_size ? formatFileSize(analysis.file_size) : '-'}
                        </td>
                        
                        <td>
                          <span className={getStatusBadge(analysis.status)}>
                            {t(`analysis.status.${analysis.status}`)}
                          </span>
                        </td>
                        
                        <td className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Activity className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-medium">
                              {analysis.statistics?.chemical_entities_count || 0}
                            </span>
                          </div>
                        </td>
                        
                        <td className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Zap className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-400 font-medium">
                              {analysis.statistics?.smiles_structures_count || 0}
                            </span>
                          </div>
                        </td>
                        
                        <td className="text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(analysis.created_at)}</span>
                          </div>
                        </td>
                        
                        <td>
                          <div className="flex items-center space-x-2">
                            {analysis.status === 'completed' && (
                              <Link
                                to={`/analysis/${analysis.id}`}
                                className="cyber-button-secondary px-3 py-1 text-xs flex items-center space-x-1"
                                title="查看结果"
                              >
                                <Eye className="w-4 h-4" />
                                <span>查看</span>
                              </Link>
                            )}
                            
                            {analysis.file_url && (
                              <a
                                href={analysis.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cyber-button-secondary px-3 py-1 text-xs flex items-center space-x-1"
                                title="下载PDF"
                              >
                                <Download className="w-4 h-4" />
                                <span>PDF</span>
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              {pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
                  <div className="text-gray-400 text-sm">
                    显示 {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total_count)} 项，共 {pagination.total_count} 条记录
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.has_prev}
                      className="cyber-button-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.previous')}
                    </button>
                    
                    <span className="text-gray-400 text-sm">
                      {pagination.page} / {pagination.total_pages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.has_next}
                      className="cyber-button-secondary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('common.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}