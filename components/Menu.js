import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  Home,
  Users,
  BookOpen,
  Database as DatabaseIcon,
  Network,
  KeyRound,
} from "lucide-react";

export default function Menu() {
  const [token, setToken] = useState("");
  const router = useRouter();

  // Un petit helper pour les classes
  const navButtonClass = (href) => {
    const base =
      "px-3 py-1.5 rounded-md border text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1";
    const active =
      router.pathname === href
        ? "bg-gray-200 border-gray-400"
        : "bg-white border-gray-300";
    return `${base} ${active}`;
  };

  return (
    <header className="w-full border-b border-gray-200 px-8 bg-white z-50">
      <div className="w-full px-2 py-1 flex items-center justify-between gap-4">
        {/* 1. Logo + Title */}
        <div className="flex items-center gap-3">
          <Image
            src="/review_pilot.png"
            alt="ReviewPilot"
            width={60}
            height={60}
            priority
          />
          <span className="text-lg font-bold text-gray-800 whitespace-nowrap">
            ReviewPilot
          </span>
        </div>

        {/* 2. Token input */}
        <div className="flex items-center gap-2">
          <KeyRound size={18} strokeWidth={1.8} className="text-gray-500" />
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Add token to unlock editing features"
            className="w-[340px] text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 3. Navigation */}
        <nav className="flex items-center gap-2 text-base">
          <Link href="/" legacyBehavior>
            <button className={navButtonClass("/")}>
              <Home size={16} strokeWidth={1.8} />
              Home
            </button>
          </Link>
          <Link href="/Authors" legacyBehavior>
            <button className={navButtonClass("/Authors")}>
              <Users size={16} strokeWidth={1.8} />
              Authors
            </button>
          </Link>
          <Link href="/Article" legacyBehavior>
            <button className={navButtonClass("/Article")}>
              <BookOpen size={16} strokeWidth={1.8} />
              Articles
            </button>
          </Link>
          <Link href="/Database" legacyBehavior>
            <button className={navButtonClass("/Database")}>
              <DatabaseIcon size={16} strokeWidth={1.8} />
              Database
            </button>
          </Link>
          <Link href="/Graph" legacyBehavior>
            <button className={navButtonClass("/Graph")}>
              <Network size={16} strokeWidth={1.8} />
              Graph
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
