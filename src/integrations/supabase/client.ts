// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://llhofjbijjxkfezidxyi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaG9mamJpamp4a2ZlemlkeHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjkzMDIsImV4cCI6MjA1ODAwNTMwMn0.sD475girHZmrVREV0AENbjvlOCeT_ArrPpS3LcOS5VQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);