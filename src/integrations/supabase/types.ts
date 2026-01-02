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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_hidden: boolean | null
          key: string
          name: string
          points_reward: number | null
          sort_order: number | null
          unlock_atmosphere: string | null
          unlock_behavior: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          is_hidden?: boolean | null
          key: string
          name: string
          points_reward?: number | null
          sort_order?: number | null
          unlock_atmosphere?: string | null
          unlock_behavior?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_hidden?: boolean | null
          key?: string
          name?: string
          points_reward?: number | null
          sort_order?: number | null
          unlock_atmosphere?: string | null
          unlock_behavior?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_type: string
          description: string | null
          icon: string
          id: string
          name: string
          xp_required: number | null
        }
        Insert: {
          badge_type?: string
          description?: string | null
          icon: string
          id?: string
          name: string
          xp_required?: number | null
        }
        Update: {
          badge_type?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          xp_required?: number | null
        }
        Relationships: []
      }
      cat_costumes: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_premium_only: boolean | null
          name: string
          price: number
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_premium_only?: boolean | null
          name: string
          price?: number
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_premium_only?: boolean | null
          name?: string
          price?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      cat_gifts: {
        Row: {
          created_at: string | null
          description: string
          gift_type: string
          icon: string
          id: string
          key: string
          name: string
          rarity: string | null
          reward_id: string | null
          reward_points: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          gift_type?: string
          icon?: string
          id?: string
          key: string
          name: string
          rarity?: string | null
          reward_id?: string | null
          reward_points?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          gift_type?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          rarity?: string | null
          reward_id?: string | null
          reward_points?: number | null
        }
        Relationships: []
      }
      group_achievements: {
        Row: {
          achieved_at: string
          achievement_type: string
          description: string | null
          group_id: string
          id: string
          title: string
        }
        Insert: {
          achieved_at?: string
          achievement_type: string
          description?: string | null
          group_id: string
          id?: string
          title: string
        }
        Update: {
          achieved_at?: string
          achievement_type?: string
          description?: string | null
          group_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_achievements_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_activities: {
        Row: {
          activity_type: string
          created_at: string
          group_id: string
          habit_name: string | null
          id: string
          streak_count: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          group_id: string
          habit_name?: string | null
          id?: string
          streak_count?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          group_id?: string
          habit_name?: string | null
          id?: string
          streak_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_challenge_progress: {
        Row: {
          challenge_id: string
          completed: boolean | null
          id: string
          progress_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          id?: string
          progress_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          id?: string
          progress_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "group_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      group_challenges: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          group_id: string
          habit_category: string | null
          id: string
          is_active: boolean | null
          start_date: string
          target_count: number
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          group_id: string
          habit_category?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_count?: number
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          group_id?: string
          habit_category?: string | null
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_count?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_challenges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chat: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          last_xp_contribution: string | null
          streak: number
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          last_xp_contribution?: string | null
          streak?: number
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          last_xp_contribution?: string | null
          streak?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_milestone_definitions: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_seasonal: boolean | null
          key: string
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          is_seasonal?: boolean | null
          key: string
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_seasonal?: boolean | null
          key?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      group_milestones: {
        Row: {
          achieved_at: string | null
          group_id: string
          id: string
          milestone_key: string
        }
        Insert: {
          achieved_at?: string | null
          group_id: string
          id?: string
          milestone_key: string
        }
        Update: {
          achieved_at?: string | null
          group_id?: string
          id?: string
          milestone_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_milestones_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_reactions: {
        Row: {
          activity_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_reactions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "group_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          level: number | null
          name: string
          total_xp: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          level?: number | null
          name: string
          total_xp?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          level?: number | null
          name?: string
          total_xp?: number | null
        }
        Relationships: []
      }
      habit_completions: {
        Row: {
          completed: boolean | null
          completed_at: string
          created_at: string | null
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string
          created_at?: string | null
          habit_id: string
          id?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string
          created_at?: string | null
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean | null
          category: string
          color: string | null
          completed_today: boolean | null
          created_at: string | null
          icon: string | null
          id: string
          intention_duration: string | null
          intention_ended: boolean | null
          intention_start_date: string | null
          last_completed_date: string | null
          last_reset_date: string | null
          name: string
          notes: string | null
          streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          category?: string
          color?: string | null
          completed_today?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          intention_duration?: string | null
          intention_ended?: boolean | null
          intention_start_date?: string | null
          last_completed_date?: string | null
          last_reset_date?: string | null
          name: string
          notes?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean | null
          category?: string
          color?: string | null
          completed_today?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          intention_duration?: string | null
          intention_ended?: boolean | null
          intention_start_date?: string | null
          last_completed_date?: string | null
          last_reset_date?: string | null
          name?: string
          notes?: string | null
          streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string | null
          date: string
          id: string
          mood_score: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          mood_score: number
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          mood_score?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plant_decorations: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          is_premium: boolean | null
          key: string
          name: string
          price: number | null
          rarity: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          is_premium?: boolean | null
          key: string
          name: string
          price?: number | null
          rarity?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_premium?: boolean | null
          key?: string
          name?: string
          price?: number | null
          rarity?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      plant_seeds: {
        Row: {
          color_palette: string | null
          created_at: string | null
          description: string
          growth_style: string | null
          icon: string
          id: string
          is_premium: boolean | null
          is_starter: boolean | null
          key: string
          name: string
          preview_image: string | null
          price: number | null
          rarity: string | null
          sort_order: number | null
        }
        Insert: {
          color_palette?: string | null
          created_at?: string | null
          description: string
          growth_style?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          is_starter?: boolean | null
          key: string
          name: string
          preview_image?: string | null
          price?: number | null
          rarity?: string | null
          sort_order?: number | null
        }
        Update: {
          color_palette?: string | null
          created_at?: string | null
          description?: string
          growth_style?: string | null
          icon?: string
          id?: string
          is_premium?: boolean | null
          is_starter?: boolean | null
          key?: string
          name?: string
          preview_image?: string | null
          price?: number | null
          rarity?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          is_premium: boolean | null
          premium_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          best_streak: number | null
          current_streak: number | null
          evening_opens: number | null
          first_open_at: string | null
          id: string
          last_break_return_at: string | null
          last_open_at: string | null
          longest_break_days: number | null
          morning_opens: number | null
          night_opens: number | null
          preferred_time: string | null
          total_app_opens: number | null
          total_days_active: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          best_streak?: number | null
          current_streak?: number | null
          evening_opens?: number | null
          first_open_at?: string | null
          id?: string
          last_break_return_at?: string | null
          last_open_at?: string | null
          longest_break_days?: number | null
          morning_opens?: number | null
          night_opens?: number | null
          preferred_time?: string | null
          total_app_opens?: number | null
          total_days_active?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          best_streak?: number | null
          current_streak?: number | null
          evening_opens?: number | null
          first_open_at?: string | null
          id?: string
          last_break_return_at?: string | null
          last_open_at?: string | null
          longest_break_days?: number | null
          morning_opens?: number | null
          night_opens?: number | null
          preferred_time?: string | null
          total_app_opens?: number | null
          total_days_active?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          group_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          group_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          group_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cat_gifts: {
        Row: {
          gift_id: string
          id: string
          received_at: string | null
          user_id: string
        }
        Insert: {
          gift_id: string
          id?: string
          received_at?: string | null
          user_id: string
        }
        Update: {
          gift_id?: string
          id?: string
          received_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_cat_gifts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "cat_gifts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_costumes: {
        Row: {
          costume_id: string
          id: string
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          costume_id: string
          id?: string
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          costume_id?: string
          id?: string
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_costumes_costume_id_fkey"
            columns: ["costume_id"]
            isOneToOne: false
            referencedRelation: "cat_costumes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_decorations: {
        Row: {
          decoration_id: string
          id: string
          is_active: boolean | null
          obtained_at: string | null
          user_id: string
        }
        Insert: {
          decoration_id: string
          id?: string
          is_active?: boolean | null
          obtained_at?: string | null
          user_id: string
        }
        Update: {
          decoration_id?: string
          id?: string
          is_active?: boolean | null
          obtained_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_decorations_decoration_id_fkey"
            columns: ["decoration_id"]
            isOneToOne: false
            referencedRelation: "plant_decorations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_equipped_costume: {
        Row: {
          costume_id: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          costume_id?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          costume_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_equipped_costume_costume_id_fkey"
            columns: ["costume_id"]
            isOneToOne: false
            referencedRelation: "cat_costumes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_planted_seed: {
        Row: {
          current_phase: string | null
          id: string
          planted_at: string | null
          seed_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_phase?: string | null
          id?: string
          planted_at?: string | null
          seed_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_phase?: string | null
          id?: string
          planted_at?: string | null
          seed_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_planted_seed_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "plant_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          balance: number
          coins_earned_today: number | null
          created_at: string | null
          current_streak_bonus: number | null
          first_habit_bonus_claimed: boolean | null
          id: string
          last_daily_bonus: string | null
          last_earn_reset_date: string | null
          last_weekly_bonus: string | null
          lifetime_days_active: number | null
          total_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          coins_earned_today?: number | null
          created_at?: string | null
          current_streak_bonus?: number | null
          first_habit_bonus_claimed?: boolean | null
          id?: string
          last_daily_bonus?: string | null
          last_earn_reset_date?: string | null
          last_weekly_bonus?: string | null
          lifetime_days_active?: number | null
          total_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          coins_earned_today?: number | null
          created_at?: string | null
          current_streak_bonus?: number | null
          first_habit_bonus_claimed?: boolean | null
          id?: string
          last_daily_bonus?: string | null
          last_earn_reset_date?: string | null
          last_weekly_bonus?: string | null
          lifetime_days_active?: number | null
          total_earned?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_seeds: {
        Row: {
          id: string
          obtained_at: string | null
          seed_id: string
          user_id: string
        }
        Insert: {
          id?: string
          obtained_at?: string | null
          seed_id: string
          user_id: string
        }
        Update: {
          id?: string
          obtained_at?: string | null
          seed_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_seeds_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "plant_seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          ambient_mode: string | null
          ambient_sounds_enabled: boolean | null
          ambient_visuals_enabled: boolean | null
          companion_type: string | null
          confetti_enabled: boolean | null
          created_at: string | null
          daily_notification: boolean | null
          daily_reset_time: string | null
          done_habit_position: string | null
          id: string
          music_enabled: boolean | null
          music_volume: number | null
          show_companion: boolean | null
          sound_enabled: boolean | null
          start_of_week: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
          vacation_mode: boolean | null
        }
        Insert: {
          ambient_mode?: string | null
          ambient_sounds_enabled?: boolean | null
          ambient_visuals_enabled?: boolean | null
          companion_type?: string | null
          confetti_enabled?: boolean | null
          created_at?: string | null
          daily_notification?: boolean | null
          daily_reset_time?: string | null
          done_habit_position?: string | null
          id?: string
          music_enabled?: boolean | null
          music_volume?: number | null
          show_companion?: boolean | null
          sound_enabled?: boolean | null
          start_of_week?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
          vacation_mode?: boolean | null
        }
        Update: {
          ambient_mode?: string | null
          ambient_sounds_enabled?: boolean | null
          ambient_visuals_enabled?: boolean | null
          companion_type?: string | null
          confetti_enabled?: boolean | null
          created_at?: string | null
          daily_notification?: boolean | null
          daily_reset_time?: string | null
          done_habit_position?: string | null
          id?: string
          music_enabled?: boolean | null
          music_volume?: number | null
          show_companion?: boolean | null
          sound_enabled?: boolean | null
          start_of_week?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
          vacation_mode?: boolean | null
        }
        Relationships: []
      }
      verified_transactions: {
        Row: {
          created_at: string
          environment: string
          id: string
          product_id: string
          purchase_type: string
          raw_receipt_data: Json | null
          transaction_id: string
          user_id: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          environment?: string
          id?: string
          product_id: string
          purchase_type: string
          raw_receipt_data?: Json | null
          transaction_id: string
          user_id: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          product_id?: string
          purchase_type?: string
          raw_receipt_data?: Json | null
          transaction_id?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_group_xp: {
        Args: { _group_id: string; _xp_amount: number }
        Returns: Json
      }
      archive_habit: { Args: { _habit_id: string }; Returns: undefined }
      award_group_milestone: {
        Args: { _group_id: string; _milestone_key: string }
        Returns: Json
      }
      award_points: {
        Args: { _amount: number; _description?: string; _type: string }
        Returns: Json
      }
      claim_daily_bonus: { Args: never; Returns: Json }
      claim_weekly_bonus: { Args: never; Returns: Json }
      earn_achievement: { Args: { _achievement_key: string }; Returns: Json }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      purchase_costume: { Args: { _costume_id: string }; Returns: Json }
      purchase_decoration: { Args: { _decoration_id: string }; Returns: Json }
      purchase_seed: { Args: { _seed_id: string }; Returns: Json }
      restore_habit: { Args: { _habit_id: string }; Returns: undefined }
      spend_points: {
        Args: { _amount: number; _description: string }
        Returns: Json
      }
      track_app_open: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
