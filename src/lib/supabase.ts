import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqgojymqutzklqzjnmkc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZ29qeW1xdXR6a2xxempubWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzU1MzUsImV4cCI6MjA4ODMxMTUzNX0.vUJn8sygRH1EmrH-Dc4hCdn_biRM9S1jxxUOhrz13eo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
