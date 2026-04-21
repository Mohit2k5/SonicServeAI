export type UserPlan = "free" | "developer" | "enterprise";

export interface User {
  id: string;
  email: string;
  name: string;
  plan: UserPlan;
  api_key: string;
  stripe_customer_id?: string;
  created_at: Date;
}

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  language: string;
  system_prompt: string;
  voice_id?: string;
  tts_model: string;
  webhook_url?: string;
  is_active: boolean;
  created_at: Date;
}

export interface VoiceSession {
  id: string;
  agent_id: string;
  user_id: string;
  started_at: Date;
  ended_at?: Date;
  duration_seconds?: number;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
  }>;
  language_detected?: string;
  tokens_used: number;
  status: "active" | "completed" | "error";
}

export interface BillingPlan {
  id: UserPlan;
  name: string;
  price_description: string;
  features: string[];
}
