import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zylhntleqwrhgsnvxicg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WhU2tG1PUNfd0DckofPK_A_m9nrCFyC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
