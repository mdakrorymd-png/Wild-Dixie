import { createBrowserClient } from "@supabase/ssr";

// Not parameterized with the Database generic — see lib/types.ts for why:
// the hand-written types there are for call-site annotations, not a full
// supabase-js schema generic. Regenerate real types with
// `supabase gen types typescript` once a live project exists and wire
// them in here.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
