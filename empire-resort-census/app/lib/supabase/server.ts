import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server Component / Route Handler client. All queries made with this
// client run under the caller's real JWT — Postgres RLS applies exactly
// as it would to any other client of the anon key. There is no
// service-role shortcut anywhere in this app. Not parameterized with the
// Database generic — see lib/supabase/client.ts.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component without a mutable response —
            // the middleware below refreshes the session on every request.
          }
        },
      },
    }
  );
}
