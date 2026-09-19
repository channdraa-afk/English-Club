export interface Member {
  id: string;
  name: string;
  class_name: string;
  generation: number; // 20 or 21
  role: 'member' | 'mentor';
  position: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

export interface Meeting {
  id: string;
  meeting_date: string;
  title: string;
  token: string;
  is_active: boolean;
  is_holiday?: boolean;
  holiday_reason?: string;
  word_of_the_day: string;
  word_meaning: string;
  starts_at?: string;
  expires_at?: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  meeting_id: string;
  member_id: string;
  submitted_at: string;
  feedback_rating?: 'boring' | 'okay' | 'super_fun';
  next_agenda_suggestion?: string;
  critique?: string;
  is_anonymous: boolean;
  member?: Member;
  meeting?: Meeting;
}

export interface Registration {
  id: string;
  full_name: string;
  class_name: string;
  whatsapp_number: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: any;
  updated_at?: string;
}

export type CompetitionCategory = 
  | 'speech'
  | 'storytelling'
  | 'debate'
  | 'newscasting'
  | 'scrabble'
  | 'spelling_bee'
  | 'read_aloud'
  | 'general_active';

export interface TalentStar {
  id: string;
  member_id: string;
  meeting_id: string;
  category: CompetitionCategory;
  notes: string;
  awarded_by: string;
  created_at: string;
}

export interface BigEvent {
  id: string;
  title: string;
  description: string;
  tag: string;
  accentColor?: 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'purple';
}

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  accentColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
}

export interface QuizQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 0 | 1 | 2 | 3; // 0: A (Red), 1: B (Blue), 2: C (Yellow), 3: D (Green)
  time_limit: number; // in seconds (e.g. 20)
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface QuizSession {
  id: string;
  quiz_id: string;
  room_code: string;
  status: 'active' | 'closed';
  created_by: string;
  created_at?: string;
  closed_at?: string;
  quiz?: Quiz;
}

export interface QuizSubmission {
  id: string;
  session_id: string;
  member_id: string;
  member_name: string;
  class_name: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  completed_at?: string;
}
