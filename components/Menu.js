import Link from "next/link";
import Image from "next/image";

export default function Menu() {
  return (
    <header className="w-full border-b border-gray-200 bg-white z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <Image
            src="/review_pilot.png"
            alt="ReviewPilot"
            width={48}
            height={48}
            priority
          />
          <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
            ReviewPilot
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-3 text-base">
          <Link href="/">
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition">
              Home
            </button>
          </Link>
          <Link href="/Authors">
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition">
              Authors
            </button>
          </Link>
          <Link href="/Article">
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition">
              Articles
            </button>
          </Link>
          <Link href="/Database">
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition">
              Database
            </button>
          </Link>
          <Link href="/Graph">
            <button className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 active:scale-95 transition">
              Graph
            </button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
