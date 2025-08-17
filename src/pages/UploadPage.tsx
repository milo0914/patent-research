import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Zap, CheckCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/CyberToast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface UploadState {
  isUploading: boolean;
  progress: number;
  analysisId?: string;
  error?: string;
}

export function UploadPage() {
  const { t } = useLanguage();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0
  });

  // 文件上传处理
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.includes('pdf')) {
      showError(t('upload.error'), t('upload.invalidFile'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      showError(t('upload.error'), t('upload.fileTooLarge'));
      return;
    }

    setUploadState({ isUploading: true, progress: 10 });

    try {
      // 转换文件为base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      setUploadState(prev => ({ ...prev, progress: 30 }));

      // 调用上传API
      const { data, error } = await supabase.functions.invoke('pdf-upload', {
        body: {
          fileData: base64Data,
          fileName: file.name,
          fileSize: file.size
        }
      });

      if (error) {
        throw new Error(error.message || '上传失败');
      }

      setUploadState(prev => ({ 
        ...prev, 
        progress: 100, 
        analysisId: data.data.analysisId 
      }));

      success(t('upload.success'), '文件上传成功，分析正在进行中');
      
      // 跳转到分析详情页面
      setTimeout(() => {
        navigate(`/analysis/${data.data.analysisId}`);
      }, 2000);

    } catch (err) {
      console.error('上传错误:', err);
      setUploadState(prev => ({ 
        ...prev, 
        isUploading: false, 
        progress: 0, 
        error: err instanceof Error ? err.message : '上传失败' 
      }));
      showError(t('upload.error'), err instanceof Error ? err.message : '上传失败');
    }
  }, [t, success, showError, navigate]);

  // 文件拖放配置
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploadState.isUploading
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold neon-text mb-4">
            {t('upload.title')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('upload.subtitle')}
          </p>
        </div>

        {/* 上传区域 */}
        <div className="cyber-card mb-8">
          <div 
            {...getRootProps()} 
            className={`cyber-dropzone min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'active' : ''
            } ${
              uploadState.isUploading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            <input {...getInputProps()} />
            
            {!uploadState.isUploading ? (
              <>
                <div className="relative mb-6">
                  <Upload className="w-16 h-16 text-cyan-400 animate-float" />
                  <div className="absolute inset-0 bg-cyan-400 rounded-full opacity-20 blur-xl"></div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  {t('upload.dropzone')}
                </h3>
                
                <div className="text-center space-y-2">
                  <p className="text-gray-400 flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>{t('upload.fileType')}</span>
                  </p>
                  <p className="text-gray-400 flex items-center justify-center space-x-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{t('upload.fileSize')}</span>
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="relative mb-6">
                  <Zap className="w-16 h-16 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 bg-purple-400 rounded-full opacity-30 blur-xl animate-pulse"></div>
                </div>
                
                <h3 className="text-2xl font-semibold mb-4 neon-text-purple">
                  {t('upload.analyzing')}
                </h3>
                
                {/* 进度条 */}
                <div className="w-full max-w-md mx-auto">
                  <div className="cyber-progress mb-4">
                    <div 
                      className="cyber-progress-bar"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-gray-400">{uploadState.progress}%</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 状态信息 */}
        {uploadState.error && (
          <div className="cyber-card border-red-500/30 bg-red-500/10 mb-8">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400 mb-1">上传失败</h4>
                <p className="text-red-300">{uploadState.error}</p>
              </div>
            </div>
          </div>
        )}

        {uploadState.analysisId && (
          <div className="cyber-card border-green-500/30 bg-green-500/10">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="font-semibold text-green-400 mb-1">上传成功</h4>
                <p className="text-green-300">文件已成功上传，正在跳转到分析结果页面...</p>
              </div>
            </div>
          </div>
        )}

        {/* 功能介绍 */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="cyber-card text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-cyan-400 mb-2">文本提取</h3>
            <p className="text-gray-400 text-sm">自动提取PDF中的文本内容和结构化信息</p>
          </div>
          
          <div className="cyber-card text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold text-purple-400 mb-2">化学结构识别</h3>
            <p className="text-gray-400 text-sm">使用AI技术识别化学结构图并转换为SMILES格式</p>
          </div>
          
          <div className="cyber-card text-center">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="font-semibold text-pink-400 mb-2">实时分析</h3>
            <p className="text-gray-400 text-sm">快速处理，实时显示分析进度和结果</p>
          </div>
        </div>
      </div>
    </div>
  );
}