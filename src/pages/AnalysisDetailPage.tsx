import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Download, Clock, CheckCircle, XCircle, 
  Activity, Zap, User, Calendar, MapPin, Beaker, Atom, 
  RefreshCw, ExternalLink, Eye
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase, Analysis } from '@/lib/supabase';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

export function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'entities' | 'structures' | 'patent'>('entities');

  useEffect(() => {
    if (id) {
      loadAnalysisDetail();
      
      // 如果是处理中状态，定时刷新
      const interval = setInterval(() => {
        if (analysis?.status === 'processing') {
          loadAnalysisDetail(true);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadAnalysisDetail = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      // 使用新的分析狀態檢查功能
      const { data, error } = await supabase.functions.invoke(`analysis-status?analysisId=${id}`, {
        method: 'GET'
      });
      
      if (error) {
        throw error;
      }
      
      setAnalysis(data.data);
    } catch (error) {
      console.error('加载分析详情失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy-MM-dd HH:mm:ss', {
      locale: language === 'zh' ? zhCN : enUS
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'processing': return <Clock className="w-6 h-6 text-yellow-400 animate-spin" />;
      case 'failed': return <XCircle className="w-6 h-6 text-red-400" />;
      default: return <Clock className="w-6 h-6 text-gray-400" />;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-20 h-20 text-gray-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-400 mb-4">分析记录未找到</h2>
          <button 
            onClick={() => navigate('/history')}
            className="cyber-button"
          >
            返回历史记录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部导航 */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/history')}
            className="cyber-button-secondary p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold neon-text">
              {analysis.file_name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(analysis.status)}
                <span className={getStatusBadge(analysis.status)}>
                  {t(`analysis.status.${analysis.status}`)}
                </span>
              </div>
              
              {refreshing && (
                <div className="flex items-center space-x-2 text-cyan-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">刷新中...</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {analysis.file_url && (
              <a
                href={analysis.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="cyber-button-secondary flex items-center space-x-2 px-4 py-2"
              >
                <Download className="w-4 h-4" />
                <span>下载PDF</span>
              </a>
            )}
            
            <button
              onClick={() => loadAnalysisDetail()}
              className="cyber-button-secondary p-2"
              title="刷新"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 分析信息概览 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="cyber-card text-center">
            <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">
              {analysis.detailed_entities?.length || analysis.chemical_entities?.length || 0}
            </p>
            <p className="text-gray-400 text-sm">化学实体</p>
          </div>
          
          <div className="cyber-card text-center">
            <Zap className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">
              {analysis.detailed_structures?.length || analysis.smiles_structures?.length || 0}
            </p>
            <p className="text-gray-400 text-sm">SMILES结构</p>
          </div>
          
          <div className="cyber-card text-center">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white mb-1">
              {analysis.processing_time || 0}
            </p>
            <p className="text-gray-400 text-sm">处理时间(秒)</p>
          </div>
          
          <div className="cyber-card text-center">
            <Calendar className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-white mb-1">
              {formatDate(analysis.created_at).split(' ')[0]}
            </p>
            <p className="text-gray-400 text-sm">分析日期</p>
          </div>
        </div>

        {/* 进度条 (仅在处理中显示) */}
        {analysis.status === 'processing' && (
          <div className="cyber-card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-cyan-400">分析进度</h3>
              <span className="text-cyan-400 font-medium">{analysis.progress_percentage || 0}%</span>
            </div>
            
            <div className="cyber-progress">
              <div 
                className="cyber-progress-bar"
                style={{ width: `${analysis.progress_percentage || 0}%` }}
              />
            </div>
            
            <p className="text-gray-400 text-sm mt-2">
              请稍候，正在分析您的PDF文档...
            </p>
          </div>
        )}

        {/* 错误信息 */}
        {analysis.status === 'failed' && analysis.error_message && (
          <div className="cyber-card border-red-500/30 bg-red-500/10 mb-8">
            <div className="flex items-center space-x-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400 mb-1">分析失败</h4>
                <p className="text-red-300">{analysis.error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* 结果内容 */}
        {analysis.status === 'completed' && (
          <>
            {/* 选项卡 */}
            <div className="cyber-card mb-6">
              <div className="flex space-x-1 bg-black/30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('entities')}
                  className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 ${
                    activeTab === 'entities'
                      ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  <span>化学实体</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('structures')}
                  className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 ${
                    activeTab === 'structures'
                      ? 'bg-pink-500/20 text-pink-400 shadow-lg shadow-pink-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>SMILES结构</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('patent')}
                  className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 ${
                    activeTab === 'patent'
                      ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>专利信息</span>
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="cyber-card">
              {/* 化学实体选项卡 */}
              {activeTab === 'entities' && (
                <div>
                  <h3 className="text-2xl font-bold neon-text-purple mb-6">化学实体</h3>
                  
                  {analysis.detailed_entities && analysis.detailed_entities.length > 0 ? (
                    <div className="grid gap-4">
                      {analysis.detailed_entities.map((entity, index) => (
                        <div key={index} className="border border-purple-500/30 rounded-lg p-4 bg-purple-500/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Beaker className="w-5 h-5 text-purple-400" />
                              <h4 className="font-semibold text-white">{entity.entity_text}</h4>
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                {entity.entity_type}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>置信度: {(entity.confidence_score * 100).toFixed(1)}%</span>
                              <span>页面: {entity.page_number}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Beaker className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">未检测到化学实体</p>
                    </div>
                  )}
                </div>
              )}

              {/* SMILES结构选项卡 */}
              {activeTab === 'structures' && (
                <div>
                  <h3 className="text-2xl font-bold neon-text-pink mb-6">SMILES结构</h3>
                  
                  {analysis.detailed_structures && analysis.detailed_structures.length > 0 ? (
                    <div className="grid gap-4">
                      {analysis.detailed_structures.map((structure, index) => (
                        <div key={index} className="border border-pink-500/30 rounded-lg p-4 bg-pink-500/5">
                          <div className="flex items-start space-x-4">
                            <Atom className="w-6 h-6 text-pink-400 mt-1" />
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white">
                                  {structure.structure_name || `结构 ${index + 1}`}
                                </h4>
                                <div className="flex items-center space-x-3 text-sm text-gray-400">
                                  <span>置信度: {(structure.confidence_score * 100).toFixed(1)}%</span>
                                  <span>页面: {structure.page_number}</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-400 text-sm font-medium">SMILES:</span>
                                  <code className="bg-black/30 px-2 py-1 rounded text-sm text-cyan-400 font-mono">
                                    {structure.smiles_string}
                                  </code>
                                </div>
                                
                                {structure.molecular_formula && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 text-sm font-medium">分子式:</span>
                                    <span className="text-white font-mono">{structure.molecular_formula}</span>
                                  </div>
                                )}
                                
                                {structure.molecular_weight && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 text-sm font-medium">分子量:</span>
                                    <span className="text-white">{structure.molecular_weight.toFixed(2)} g/mol</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Atom className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">未检测到SMILES结构</p>
                    </div>
                  )}
                </div>
              )}

              {/* 专利信息选项卡 */}
              {activeTab === 'patent' && (
                <div>
                  <h3 className="text-2xl font-bold neon-text mb-6">专利信息</h3>
                  
                  {analysis.patent_sections && Object.keys(analysis.patent_sections).length > 0 ? (
                    <div className="space-y-6">
                      {analysis.patent_sections.title && (
                        <div>
                          <h4 className="text-lg font-semibold text-cyan-400 mb-2">专利标题</h4>
                          <p className="text-white bg-black/20 p-4 rounded-lg">
                            {analysis.patent_sections.title}
                          </p>
                        </div>
                      )}
                      
                      {analysis.patent_sections.abstract && (
                        <div>
                          <h4 className="text-lg font-semibold text-cyan-400 mb-2">摘要</h4>
                          <p className="text-gray-300 bg-black/20 p-4 rounded-lg leading-relaxed">
                            {analysis.patent_sections.abstract}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {analysis.patent_sections.inventors && analysis.patent_sections.inventors.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-cyan-400 mb-2">发明人</h4>
                            <div className="space-y-2">
                              {analysis.patent_sections.inventors.map((inventor, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-white">{inventor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {analysis.patent_sections.applicants && analysis.patent_sections.applicants.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold text-cyan-400 mb-2">申请人</h4>
                            <div className="space-y-2">
                              {analysis.patent_sections.applicants.map((applicant, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-white">{applicant}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {analysis.patent_sections.publication_number && (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-cyan-400 mb-2">公开号</h4>
                            <p className="text-white font-mono">{analysis.patent_sections.publication_number}</p>
                          </div>
                          
                          {analysis.patent_sections.publication_date && (
                            <div>
                              <h4 className="text-lg font-semibold text-cyan-400 mb-2">公开日期</h4>
                              <p className="text-white">{analysis.patent_sections.publication_date}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {analysis.patent_sections.claims && analysis.patent_sections.claims.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-cyan-400 mb-2">权利要求</h4>
                          <div className="space-y-3">
                            {analysis.patent_sections.claims.slice(0, 3).map((claim, index) => (
                              <div key={index} className="bg-black/20 p-4 rounded-lg">
                                <div className="flex items-start space-x-3">
                                  <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs font-medium mt-1">
                                    {index + 1}
                                  </span>
                                  <p className="text-gray-300 leading-relaxed">{claim}</p>
                                </div>
                              </div>
                            ))}
                            
                            {analysis.patent_sections.claims.length > 3 && (
                              <p className="text-gray-400 text-sm text-center">
                                ... 及其他 {analysis.patent_sections.claims.length - 3} 项权利要求
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">未提取到专利信息</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}