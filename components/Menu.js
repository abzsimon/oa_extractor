import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  return (
    <header className="w-full border-b border-gray-200 px-8 bg-white z-50">
      {/* Full‑width flex container without extra side padding */}
      <div className="w-full px-2 py-1 flex items-center justify-between gap-4">
        {/* 1. Logo + Title (left) */}
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

        {/* 2. Token input (center) */}
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

        {/* 3. Navigation (right) */}
        <nav className="flex items-center gap-2 text-base">
          <Link href="/">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1">
              <Home size={16} strokeWidth={1.8} />
              Home
            </button>
          </Link>
          <Link href="/Authors">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1">
              <Users size={16} strokeWidth={1.8} />
              Authors
            </button>
          </Link>
          <Link href="/Article">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1">
              <BookOpen size={16} strokeWidth={1.8} />
              Articles
            </button>
          </Link>
          <Link href="/Database">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1">
              <DatabaseIcon size={16} strokeWidth={1.8} />
              Database
            </button>
          </Link>
          <Link href="/Graph">
            <button className="px-3 py-1.5 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition flex items-center gap-1">
              <Network size={16} strokeWidth={1.8} />
              Graph
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
