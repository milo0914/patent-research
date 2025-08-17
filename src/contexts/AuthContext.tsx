import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, UserProfile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载用户信息
  useEffect(() => {
    async function loadUser() {
      setLoading(true)
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await loadUserProfile(user.id)
        }
      } finally {
        setLoading(false)
      }
    }
    loadUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 加载用户配置
  async function loadUserProfile(userId: string) {
    console.log('开始加载用户配置...', userId.substring(0, 8) + '...')
    
    try {
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.warn('用户配置加载超时')
        controller.abort()
      }, 15000) // 15秒超时
      
      const { data, error } = await supabase.functions.invoke('user-profile', {
        method: 'GET'
      })
      
      clearTimeout(timeoutId)
      
      if (error) {
        console.error('加载用户配置错误:', error)
        
        // 如果是超时错误，设置默认配置，避免页面卡住
        if (error.message?.includes('超时') || error.message?.includes('timeout')) {
          console.warn('用户配置加载超时，使用默认配置')
          setProfile({
            id: 'temp',
            user_id: userId,
            display_name: '用户',
            language_preference: 'zh',
            email_notifications: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          return
        }
        
        throw error
      }
      
      console.log('用户配置加载成功')
      setProfile(data.data)
    } catch (error: any) {
      console.error('加载用户配置失败:', error)
      
      // 设置默认配置，避免页面卡住
      setProfile({
        id: 'temp',
        user_id: userId,
        display_name: '用户',
        language_preference: 'zh',
        email_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
  }

  // 登录
  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    return result
  }

  // 注册
  async function signUp(email: string, password: string) {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return result
  }

  // 登出
  async function signOut() {
    const result = await supabase.auth.signOut()
    setProfile(null)
    return result
  }

  // 更新用户配置
  async function updateProfile(updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.functions.invoke('user-profile', {
        method: 'PATCH',
        body: updates
      })
      
      if (error) throw error
      setProfile(data.data)
      return data.data
    } catch (error) {
      console.error('更新用户配置失败:', error)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}