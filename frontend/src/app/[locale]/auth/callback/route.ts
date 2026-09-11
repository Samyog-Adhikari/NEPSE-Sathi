import { NextResponse } from "next/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";

  if (code) {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${redirect.startsWith("/") ? redirect : `/${redirect}`}`);
}
