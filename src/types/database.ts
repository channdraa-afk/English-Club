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
