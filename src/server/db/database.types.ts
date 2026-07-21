export type AnalysisStatus = "queued" | "running" | "completed" | "failed";
export type Severity = "critical" | "high" | "medium" | "low" | "info";

type Timestamp = string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          ai_fix_credits_used: number;
          ai_fix_credits_limit: number;
          created_at: Timestamp;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          ai_fix_credits_used?: number;
          ai_fix_credits_limit?: number;
          created_at?: Timestamp;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          ai_fix_credits_used?: number;
          ai_fix_credits_limit?: number;
        };
        Relationships: [];
      };
      sites: {
        Row: { id: string; user_id: string; url: string; domain: string; created_at: Timestamp };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          domain: string;
          created_at?: Timestamp;
        };
        Update: { url?: string; domain?: string };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          site_id: string;
          status: AnalysisStatus;
          overall_score: number | null;
          seo_score: number | null;
          performance_score: number | null;
          accessibility_score: number | null;
          security_score: number | null;
          mobile_score: number | null;
          ux_score: number | null;
          executive_summary: string | null;
          ai_content: Record<string, unknown> | null;
          ai_generated_at: Timestamp | null;
          ai_prompt_version: string | null;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          site_id: string;
          status: AnalysisStatus;
          overall_score?: number | null;
          seo_score?: number | null;
          performance_score?: number | null;
          accessibility_score?: number | null;
          security_score?: number | null;
          mobile_score?: number | null;
          ux_score?: number | null;
          executive_summary?: string | null;
          ai_content?: Record<string, unknown> | null;
          ai_generated_at?: Timestamp | null;
          ai_prompt_version?: string | null;
          created_at?: Timestamp;
        };
        Update: {
          status?: AnalysisStatus;
          overall_score?: number | null;
          seo_score?: number | null;
          performance_score?: number | null;
          accessibility_score?: number | null;
          security_score?: number | null;
          mobile_score?: number | null;
          ux_score?: number | null;
          executive_summary?: string | null;
          ai_content?: Record<string, unknown> | null;
          ai_generated_at?: Timestamp | null;
          ai_prompt_version?: string | null;
        };
        Relationships: [];
      };
      issues: {
        Row: {
          id: string;
          analysis_id: string;
          category: string;
          severity: Severity;
          title: string;
          description: string;
          recommendation: string;
          estimated_fix_time: string;
          source: string;
          evidence: Record<string, unknown>;
          ai_explanation: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          category: string;
          severity: Severity;
          title: string;
          description: string;
          recommendation: string;
          estimated_fix_time: string;
          source?: string;
          evidence?: Record<string, unknown>;
          ai_explanation?: Record<string, unknown> | null;
        };
        Update: {
          category?: string;
          severity?: Severity;
          title?: string;
          description?: string;
          recommendation?: string;
          estimated_fix_time?: string;
          source?: string;
          evidence?: Record<string, unknown>;
          ai_explanation?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          analysis_id: string;
          priority: number;
          title: string;
          description: string;
          expected_impact: string;
        };
        Insert: {
          id?: string;
          analysis_id: string;
          priority: number;
          title: string;
          description: string;
          expected_impact: string;
        };
        Update: {
          priority?: number;
          title?: string;
          description?: string;
          expected_impact?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { consume_ai_fix_credit: { Args: Record<string, never>; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
