"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, LogIn, Search, UserPlus } from "lucide-react";

import { navLinks, siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation. Derived during render (not an
  // effect) to avoid a cascading-render setState-in-effect pattern.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }



  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-gradient-to-b from-black/45 via-black/15 to-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 shrink-0">
          <motion.div>
            <Image
              src="/logo-full.png"
              alt="Sai Baba Transport"
              width={80}
              height={40}
              className="bg-white rounded-xl p-1"
              priority
            />
          </motion.div>

        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {navLinks.map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => link.children && setOpenDesktopMenu(link.href)}
              onMouseLeave={() => link.children && setOpenDesktopMenu(null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-2 text-[13.5px] font-semibold transition-colors duration-200 hover:text-primary",
                  scrolled ? "text-foreground/80" : "text-white/85",
                  pathname === link.href && "text-primary"
                )}
              >
                {link.label}
                {link.children && <ChevronDown className="size-3.5" />}
              </Link>
              <AnimatePresence>
                {link.children && openDesktopMenu === link.href && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full pt-2"
                  >
                    <div className="min-w-56 rounded-2xl border border-border/70 bg-popover p-1.5 shadow-xl shadow-black/[0.06]">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-1.5 xl:flex">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            title="Customer Login"
            aria-label="Customer Login"
            className={cn(!scrolled && "text-white hover:bg-white/10 hover:text-white")}
          >
            <a href={siteConfig.crmUrl} target="_blank" rel="noopener noreferrer">
              <LogIn className="size-4" />
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className={cn(!scrolled && "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white")}
          >
            <Link href="/track">
              <Search className="size-4" />
              Track Shipment
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className={cn(!scrolled && "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white")}
          >
            <Link href="/register">
              <UserPlus className="size-4" />
              Register
            </Link>
          </Button>
          <Button size="sm" asChild className="group">
            <Link href="/estimate">
              <Phone className="size-4" />
              Get a Quote
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 font-display text-xl tracking-wide">
                <Image src="/logo.png" alt="" width={32} height={32} className="size-8" />
                SAIBABA TRANSPORT
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-3 flex flex-col border-l border-border pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button variant="outline" asChild>
                  <Link href="/track">
                    <Search className="size-4" /> Track Shipment
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/register">
                    <UserPlus className="size-4" /> Customer Registration
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href={siteConfig.crmUrl} target="_blank" rel="noopener noreferrer">
                    <LogIn className="size-4" /> Customer Login
                  </a>
                </Button>
                <Button asChild>
                  <Link href="/estimate">
                    <Phone className="size-4" /> Get a Quote
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
