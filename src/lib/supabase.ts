import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hqsbmomlubeasmpnwkcb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxc2Jtb21sdWJlYXNtcG53a2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MTg5NDEsImV4cCI6MjEwNTE5NDk0MX0.uEsHxNoOYMEGrq1wz8VDn45Jix_Os4wqwpD-VzGZ7lM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
