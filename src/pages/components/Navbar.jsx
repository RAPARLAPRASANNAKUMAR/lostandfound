import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 md:px-8 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo192.png" alt="Find & Return" className="h-9 w-9 rounded-md" />
          <span className="text-2xl md:text-3xl font-display font-extrabold">Find & Return</span>
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          <Link
            to="/report"
            className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-white font-semibold shadow-sm shadow-blue-600/20 hover:bg-blue-500 transition"
          >
            Report Lost Item
          </Link>
          <Link
            to="/admin"
            className="inline-flex h-10 items-center rounded-xl px-3 font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}