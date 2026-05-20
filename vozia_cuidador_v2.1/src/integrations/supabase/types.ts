export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      caregivers: {
        Row: {
          caregiver_user_id: string
          created_at: string
          id: string
          patient_id: string
        }
        Insert: {
          caregiver_user_id: string
          created_at?: string
          id?: string
          patient_id: string
        }
        Update: {
          caregiver_user_id?: string
          created_at?: string
          id?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "caregivers_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          report_date: string
          summary: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          report_date?: string
          summary?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          report_date?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          id: string
          notes: string | null
          occurred_at: string
          patient_id: string
          recorded_by: string | null
          type: Database["public"]["Enums"]["event_type"]
          value: string | null
        }
        Insert: {
          id?: string
          notes?: string | null
          occurred_at?: string
          patient_id: string
          recorded_by?: string | null
          type: Database["public"]["Enums"]["event_type"]
          value?: string | null
        }
        Update: {
          id?: string
          notes?: string | null
          occurred_at?: string
          patient_id?: string
          recorded_by?: string | null
          type?: Database["public"]["Enums"]["event_type"]
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["med_status"]
          taken_at: string
          taken_by: string | null
        }
        Insert: {
          id?: string
          medication_id: string
          notes?: string | null
          patient_id: string
          status: Database["public"]["Enums"]["med_status"]
          taken_at?: string
          taken_by?: string | null
        }
        Update: {
          id?: string
          medication_id?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["med_status"]
          taken_at?: string
          taken_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean
          created_at: string
          dose: string | null
          duration: string | null
          frequency: string | null
          id: string
          name: string
          notes: string | null
          patient_id: string
          schedule_time: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          dose?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          name: string
          notes?: string | null
          patient_id: string
          schedule_time?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          dose?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          name?: string
          notes?: string | null
          patient_id?: string
          schedule_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          age: number | null
          allergies: string | null
          birth_date: string | null
          chronic_conditions: string | null
          continuous_medications: string | null
          created_at: string
          diagnosis: string | null
          doctor_name: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          notes: string | null
          owner_id: string
          patient_user_id: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          chronic_conditions?: string | null
          continuous_medications?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_name?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          notes?: string | null
          owner_id: string
          patient_user_id?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          allergies?: string | null
          birth_date?: string | null
          chronic_conditions?: string | null
          continuous_medications?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_name?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          owner_id?: string
          patient_user_id?: string | null
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quick_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          patient_id: string
          sent_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          patient_id: string
          sent_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          patient_id?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_logs: {
        Row: {
          completed_at: string
          completed_by: string | null
          id: string
          notes: string | null
          patient_id: string
          routine_id: string
        }
        Insert: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          routine_id: string
        }
        Update: {
          completed_at?: string
          completed_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          routine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_logs_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          schedule_time: string | null
          type: Database["public"]["Enums"]["routine_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          schedule_time?: string | null
          type: Database["public"]["Enums"]["routine_type"]
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          schedule_time?: string | null
          type?: Database["public"]["Enums"]["routine_type"]
        }
        Relationships: [
          {
            foreignKeyName: "routines_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          diastolic: number | null
          glucose: number | null
          heart_rate: number | null
          id: string
          measured_at: string
          notes: string | null
          oxygen_saturation: number | null
          pain_level: number | null
          patient_id: string
          recorded_by: string | null
          systolic: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          diastolic?: number | null
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          recorded_by?: string | null
          systolic?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          diastolic?: number | null
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          measured_at?: string
          notes?: string | null
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          recorded_by?: string | null
          systolic?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_patient: { Args: { _patient_id: string }; Returns: boolean }
      is_caregiver_of: { Args: { _patient_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "familiar_admin" | "cuidador" | "paciente"
      event_type:
        | "dor"
        | "febre"
        | "pressao"
        | "glicemia"
        | "queda"
        | "agitacao"
        | "alimentacao"
        | "evacuacao"
        | "sono"
        | "observacao"
      med_status: "administrado" | "adiado" | "nao_administrado"
      routine_type:
        | "banho"
        | "alimentacao"
        | "hidratacao"
        | "fisioterapia"
        | "caminhada"
        | "sono"
        | "troca_posicao"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["familiar_admin", "cuidador", "paciente"],
      event_type: [
        "dor",
        "febre",
        "pressao",
        "glicemia",
        "queda",
        "agitacao",
        "alimentacao",
        "evacuacao",
        "sono",
        "observacao",
      ],
      med_status: ["administrado", "adiado", "nao_administrado"],
      routine_type: [
        "banho",
        "alimentacao",
        "hidratacao",
        "fisioterapia",
        "caminhada",
        "sono",
        "troca_posicao",
      ],
    },
  },
} as const
