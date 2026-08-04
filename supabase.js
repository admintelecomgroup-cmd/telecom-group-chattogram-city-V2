/* ==========================================
   Supabase Configuration
   Telecom Group Chattogram City
========================================== */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* ==========================================
   Project Credentials
========================================== */

const SUPABASE_URL = "https://ebbamrzqnxtuvcfufgzb.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_iqAEAcv0lQ5B7jSQ0JjaJw_grRxbBbC";

/* ==========================================
   Create Supabase Client
========================================== */

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);