"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function AppProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const locale = pathname.startsWith("/ne") ? "ne" : "en";

  React.useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session) {
          setIsAuthenticated(false);
          // Redirect to login with current path preserved for post-login return
          const loginUrl = `/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`;
          router.replace(loginUrl);
        } else {
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Auth check error:", e);
        if (mounted) {
          router.replace(`/${locale}/auth/login`);
        }
      } finally {
        if (mounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && mounted) {
        setIsAuthenticated(false);
        router.replace(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (session && mounted) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, locale]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">Verifying authentication...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
