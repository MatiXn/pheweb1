import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://zylhntleqwrhgsnvxicg.supabase.co",
  "sb_publishable_WhU2tG1PUNfd0DckofPK_A_m9nrCFyC",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);
