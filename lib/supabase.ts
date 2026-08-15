import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kxtehfmmzccouymqbucs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'Sb_publishable_r7ZksVW2-DxNcMTFl9w3Pg_AXqFjRcD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
