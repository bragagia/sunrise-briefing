export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      briefings: {
        Row: {
          content: string;
          created_at: string;
          id: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: number;
        };
        Relationships: [];
      };
      news: {
        Row: {
          content: string;
          created_at: string;
          digest: string | null;
          id: number;
          link: string;
          magnitude: number | null;
          novelty: number | null;
          potential: number | null;
          published_at: string;
          reliability: number | null;
          scale: number | null;
          source: string;
          title: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          digest?: string | null;
          id?: number;
          link: string;
          magnitude?: number | null;
          novelty?: number | null;
          potential?: number | null;
          published_at: string;
          reliability?: number | null;
          scale?: number | null;
          source: string;
          title: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          digest?: string | null;
          id?: number;
          link?: string;
          magnitude?: number | null;
          novelty?: number | null;
          potential?: number | null;
          published_at?: string;
          reliability?: number | null;
          scale?: number | null;
          source?: string;
          title?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          created_at: string;
          email: string;
          id: number;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
