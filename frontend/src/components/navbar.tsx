"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Home, BookOpen, Mail, LayoutDashboard, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const pathname = usePathname() || "/en";
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userName, setUserName] = React.useState<string | null>(null);

  const locale = pathname.startsWith("/ne") ? "ne" : "en";
  const isNepali = locale === "ne";

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      const user = res?.data?.user;
      if (user) {
        setIsLoggedIn(true);
        const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];
        setUserName(name || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setIsLoggedIn(true);
        const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0];
        setUserName(name || null);
      } else {
        setIsLoggedIn(false);
        setUserName(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Clean public visitor links (Home, Features, About, Contact)
  const navItems = [
    {
      label: isNepali ? "गृहपृष्ठ" : "Home",
      href: `/${locale}`,
      icon: Home,
    },
    {
      label: isNepali ? "सुविधाहरू" : "Features",
      href: `/${locale}/features`,
      icon: BookOpen,
    },
    {
      label: isNepali ? "हाम्रोबारे" : "About",
      href: `/${locale}/about`,
      icon: BookOpen,
    },
    {
      label: isNepali ? "सम्पर्क" : "Contact",
      href: `/${locale}/contact`,
      icon: Mail,
    },
  ];

  return (
    <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex items-center justify-between rounded-full border border-border/80 bg-background/85 backdrop-blur-md shadow-xs px-3 sm:px-5 py-2">
          {/* Logo & Brand Name */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full pr-2"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="NEPSE Sathi"
                width={36}
                height={36}
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-foreground">
              NEPSE<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Sathi</span>
            </span>
          </Link>

          {/* Center Clean Public Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== `/${locale}` && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {isLoggedIn ? (
              /* If logged in: direct CTA to Dashboard */
              <Link
                href={`/${locale}/dashboard`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full gap-1.5 px-4 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs group cursor-pointer transition-all"
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isNepali ? "ड्यासबोर्ड" : "Dashboard"}</span>
              </Link>
            ) : (
              /* If not logged in: Sign in & Get Started */
              <>
                <Link
                  href={`/${locale}/auth/login`}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "hidden lg:inline-flex text-xs font-medium text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isNepali ? "लगइन" : "Sign in"}
                </Link>

                <Link
                  href={`/${locale}/auth/register`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full gap-1.5 px-4 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs group cursor-pointer transition-all"
                  )}
                >
                  <span>{isNepali ? "सुरु गर्नुहोस्" : "Get Started"}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </>
            )}

            {/* Mobile Navigation Drawer */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger
                  className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "rounded-full cursor-pointer")}
                  aria-label="Toggle navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    <SheetHeader className="p-0">
                      <SheetTitle className="flex items-center gap-2.5 text-left">
                        <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        <span className="font-bold text-base">NEPSE Sathi</span>
                      </SheetTitle>
                    </SheetHeader>

                    <Separator />

                    <div className="space-y-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>

                    {isLoggedIn ? (
                      <Link
                        href={`/${locale}/dashboard`}
                        onClick={() => setIsOpen(false)}
                        className={cn(buttonVariants({ size: "default" }), "w-full text-xs text-center flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white")}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{isNepali ? "ड्यासबोर्डमा जानुहोस्" : "Go to Dashboard"}</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          href={`/${locale}/auth/login`}
                          onClick={() => setIsOpen(false)}
                          className={cn(buttonVariants({ variant: "outline" }), "w-full text-xs text-center block")}
                        >
                          {isNepali ? "लगइन" : "Sign in"}
                        </Link>
                        <Link
                          href={`/${locale}/auth/register`}
                          onClick={() => setIsOpen(false)}
                          className={cn(buttonVariants({ size: "default" }), "w-full text-xs text-center block bg-emerald-600 hover:bg-emerald-700 text-white")}
                        >
                          {isNepali ? "सुरु गर्नुहोस्" : "Get Started"}
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
