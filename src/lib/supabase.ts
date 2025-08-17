import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://augozmbjvcjufbuzzifi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Z296bWJqdmNqdWZidXp6aWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMTQzOTEsImV4cCI6MjA3MDg5MDM5MX0.Z42aZ6sBmUGUxJ5jp2CIXBDn1GfqGOouwrwCVk8NBuM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  language_preference: 'zh' | 'en'
  email_notifications: boolean
  created_at: string
  updated_at: string
  email?: string
}

export interface Analysis {
  id: string
  user_id: string
  file_name: string
  file_size: number
  file_url: string
  status: 'processing' | 'completed' | 'failed'
  chemical_entities: ChemicalEntity[]
  smiles_structures: SmilesStructure[]
  patent_sections: PatentSections
  processing_time?: number
  error_message?: string
  progress_percentage: number
  created_at: string
  updated_at: string
  analysis_started_at?: string
  analysis_completed_at?: string
  detailed_entities?: ChemicalEntity[]
  detailed_structures?: SmilesStructure[]
  statistics?: {
    chemical_entities_count: number
    smiles_structures_count: number
    has_patent_sections: boolean
  }
}

export interface ChemicalEntity {
  id?: string
  analysis_id?: string
  entity_type: string
  entity_text: string
  confidence_score: number
  page_number: number
  position_data?: any
}

export interface SmilesStructure {
  id?: string
  analysis_id?: string
  smiles_string: string
  structure_name: string
  confidence_score: number
  page_number: number
  molecular_formula?: string
  molecular_weight?: number
  validation_status?: string
}

export interface PatentSections {
  title?: string
  abstract?: string
  inventors?: string[]
  applicants?: string[]
  publication_number?: string
  publication_date?: string
  field_of_invention?: string
  claims?: string[]
  background?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}