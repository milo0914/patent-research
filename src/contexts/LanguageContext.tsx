import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻译映射
const translations = {
  zh: {
    // 通用
    'app.title': '專利化學結構分析器',
    'app.subtitle': '基於AI的PDF專利文檔化學結構識別與SMILES生成',
    'common.loading': '載入中...',
    'common.error': '錯誤',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '確認',
    'common.save': '儲存',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.view': '檢視',
    'common.download': '下載',
    'common.upload': '上傳',
    'common.search': '搜尋',
    'common.filter': '篩選',
    'common.refresh': '重新整理',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.close': '關閉',
    
    // 認證
    'auth.login': '登入',
    'auth.register': '註冊',
    'auth.logout': '登出',
    'auth.email': '信箱',
    'auth.password': '密碼',
    'auth.confirmPassword': '確認密碼',
    'auth.forgotPassword': '忘記密碼',
    'auth.loginSuccess': '登入成功',
    'auth.registerSuccess': '註冊成功，請檢查信箱驗證連結',
    'auth.loginError': '登入失敗',
    'auth.registerError': '註冊失敗',
    'auth.invalidCredentials': '信箱或密碼錯誤',
    'auth.weakPassword': '密碼強度不足',
    'auth.emailRequired': '請輸入信箱',
    'auth.passwordRequired': '請輸入密碼',
    'auth.passwordMismatch': '兩次輸入的密碼不一致',
    'auth.alreadyHaveAccount': '已有帳戶？',
    'auth.noAccount': '還沒有帳戶？',
    
    // 導航
    'nav.dashboard': '儀表板',
    'nav.upload': '上傳分析',
    'nav.history': '歷史記錄',
    'nav.profile': '個人設定',
    'nav.admin': '管理後台',
    
    // 上傳頁面
    'upload.title': 'PDF專利文檔上傳',
    'upload.subtitle': '上傳您的專利PDF文檔，我們將自動提取化學結構並生成SMILES格式',
    'upload.dropzone': '拖拽PDF檔案到此處，或點擊選擇檔案',
    'upload.fileSize': '檔案大小限制：最大50MB',
    'upload.fileType': '支援格式：PDF',
    'upload.analyzing': '分析中...',
    'upload.success': '上傳成功',
    'upload.error': '上傳失敗',
    'upload.invalidFile': '請選擇有效的PDF檔案',
    'upload.fileTooLarge': '檔案大小超過50MB限制',
    
    // 分析結果
    'analysis.title': '分析結果',
    'analysis.status.processing': '處理中',
    'analysis.status.completed': '已完成',
    'analysis.status.failed': '失敗',
    'analysis.chemicalEntities': '化學實體',
    'analysis.smilesStructures': 'SMILES結構',
    'analysis.patentInfo': '專利資訊',
    'analysis.downloadReport': '下載報告',
    'analysis.viewDetails': '檢視詳情',
    'analysis.confidence': '置信度',
    'analysis.page': '頁面',
    'analysis.molecularFormula': '分子式',
    'analysis.molecularWeight': '分子量',
    
    // 歷史記錄
    'history.title': '分析歷史',
    'history.empty': '暫無分析記錄',
    'history.fileName': '檔案名稱',
    'history.status': '狀態',
    'history.createdAt': '建立時間',
    'history.entities': '化學實體數',
    'history.structures': 'SMILES結構數',
    
    // 設定
    'settings.title': '個人設定',
    'settings.profile': '個人資料',
    'settings.language': '語言設定',
    'settings.notifications': '通知設定',
    'settings.displayName': '顯示名稱',
    'settings.emailNotifications': '郵件通知',
    'settings.languageZh': '繁體中文',
    'settings.languageEn': 'English',
    'settings.updateSuccess': '設定更新成功',
    'settings.updateError': '設定更新失敗',
  },
  en: {
    // Common
    'app.title': 'Patent Chemical Structure Analyzer',
    'app.subtitle': 'AI-powered PDF patent document chemical structure recognition and SMILES generation',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password',
    'auth.loginSuccess': 'Login successful',
    'auth.registerSuccess': 'Registration successful, please check your email for verification',
    'auth.loginError': 'Login failed',
    'auth.registerError': 'Registration failed',
    'auth.invalidCredentials': 'Invalid email or password',
    'auth.weakPassword': 'Password is too weak',
    'auth.emailRequired': 'Email is required',
    'auth.passwordRequired': 'Password is required',
    'auth.passwordMismatch': 'Passwords do not match',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.noAccount': 'Don\'t have an account?',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.upload': 'Upload & Analyze',
    'nav.history': 'History',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    
    // Upload page
    'upload.title': 'PDF Patent Document Upload',
    'upload.subtitle': 'Upload your patent PDF document and we will automatically extract chemical structures and generate SMILES format',
    'upload.dropzone': 'Drag and drop PDF files here, or click to select files',
    'upload.fileSize': 'File size limit: Maximum 50MB',
    'upload.fileType': 'Supported format: PDF',
    'upload.analyzing': 'Analyzing...',
    'upload.success': 'Upload successful',
    'upload.error': 'Upload failed',
    'upload.invalidFile': 'Please select a valid PDF file',
    'upload.fileTooLarge': 'File size exceeds 50MB limit',
    
    // Analysis results
    'analysis.title': 'Analysis Results',
    'analysis.status.processing': 'Processing',
    'analysis.status.completed': 'Completed',
    'analysis.status.failed': 'Failed',
    'analysis.chemicalEntities': 'Chemical Entities',
    'analysis.smilesStructures': 'SMILES Structures',
    'analysis.patentInfo': 'Patent Information',
    'analysis.downloadReport': 'Download Report',
    'analysis.viewDetails': 'View Details',
    'analysis.confidence': 'Confidence',
    'analysis.page': 'Page',
    'analysis.molecularFormula': 'Molecular Formula',
    'analysis.molecularWeight': 'Molecular Weight',
    
    // History
    'history.title': 'Analysis History',
    'history.empty': 'No analysis records',
    'history.fileName': 'File Name',
    'history.status': 'Status',
    'history.createdAt': 'Created At',
    'history.entities': 'Chemical Entities',
    'history.structures': 'SMILES Structures',
    
    // Settings
    'settings.title': 'Profile Settings',
    'settings.profile': 'Profile',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.displayName': 'Display Name',
    'settings.emailNotifications': 'Email Notifications',
    'settings.languageZh': '中文',
    'settings.languageEn': 'English',
    'settings.updateSuccess': 'Settings updated successfully',
    'settings.updateError': 'Failed to update settings',
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useAuth()
  const [language, setLanguageState] = useState<Language>('zh')

  // 初始化语言设置
  useEffect(() => {
    if (profile?.language_preference) {
      setLanguageState(profile.language_preference)
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language.toLowerCase()
      const detectedLang = browserLang.startsWith('zh') ? 'zh' : 'en'
      setLanguageState(detectedLang)
    }
  }, [profile])

  // 设置语言
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    
    // 如果用户已登录，更新数据库中的偏好设置
    if (profile) {
      try {
        await updateProfile({ language_preference: lang })
      } catch (error) {
        console.error('更新語言偏好失敗:', error)
      }
    }
  }

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}