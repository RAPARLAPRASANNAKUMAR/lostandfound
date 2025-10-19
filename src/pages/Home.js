import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ItemCard from '../components/ItemCard'; // This now matches Step 1

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qText, setQText] = useState('');
  const [chip, setChip] = useState('all');

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'items'),
      (snap) => {
        const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const isApproved = (i) => {
          const s = String(i.status || i.approvalStatus || '').toLowerCase();
          return i.isApproved === true || i.approved === true || s === 'approved' || s === 'hod-approved';
        };
        const approved = raw.filter(isApproved);
        setItems(approved);
        setLoading(false);
      },
      (err) => {
        console.error('Feed subscribe failed:', err);
        setItems([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const txt = qText.trim().toLowerCase();
    const hasPhoto = (i) => Boolean(i.imageBase64 || i.imageUrl);
    const getMillis = (i) => {
      const t = i.approvedAt || i.createdAt || i.timestamp;
      if (!t) return 0;
      if (typeof t === 'number') return t;
      if (t?.seconds) return t.seconds * 1000 + (t.nanoseconds || 0) / 1e6;
      const d = new Date(t);
      return isNaN(d) ? 0 : d.getTime();
    };

    let list = items.slice();
    if (chip === 'photo') list = list.filter(hasPhoto);
    if (chip === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((i) => getMillis(i) >= sevenDaysAgo);
    }
    if (txt) {
      list = list.filter((i) =>
        [i.name, i.location, i.description].filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(txt))
      );
    }
    list.sort((a, b) => getMillis(b) - getMillis(a));
    return list;
  }, [items, qText, chip]);

  const stats = useMemo(() => {
    const hasPhoto = items.filter(i => i.imageBase64 || i.imageUrl).length;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = items.filter(i => {
      const t = i.approvedAt || i.createdAt || i.timestamp;
      if (!t) return false;
      const millis = typeof t === 'number' ? t : (t?.seconds ? t.seconds * 1000 : new Date(t).getTime());
      return millis >= sevenDaysAgo;
    }).length;
    return { total: items.length, withPhoto: hasPhoto, recent };
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTEyIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0yNCAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              Find What's <span className="text-yellow-300">Lost</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              Reuniting people with their belongings. Browse lost items, report finds, and help make someone's day.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold text-yellow-300">{stats.total}</div>
                <div className="text-sm text-blue-100 mt-1">Total Items</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold text-green-300">{stats.recent}</div>
                <div className="text-sm text-blue-100 mt-1">This Week</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl font-bold text-pink-300">{stats.withPhoto}</div>
                <div className="text-sm text-blue-100 mt-1">With Photos</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        {/* Search and Filters */}
        <section className="mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Search by item name, location, or description..."
                className="w-full h-14 pl-12 pr-32 rounded-2xl border-2 border-gray-200 bg-white text-gray-800 shadow-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 text-lg"
              />
              {qText && (
                <button
                  onClick={() => setQText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setChip('all')}
              className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                chip === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                All Items
              </span>
            </button>
            
            <button
              onClick={() => setChip('photo')}
              className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                chip === 'photo'
                  ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg shadow-green-500/50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                With Photo
              </span>
            </button>
            
            <button
              onClick={() => setChip('recent')}
              className={`group relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                chip === 'recent'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Last 7 Days
              </span>
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-10 bg-gray-200 rounded-full w-24" />
                      <div className="h-10 bg-gray-200 rounded-full w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl mb-6">
                <svg className="w-24 h-24 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Items Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {qText 
                  ? `No results for "${qText}". Try adjusting your search or filters.`
                  : 'No items match your current filters. Try selecting different options.'}
              </p>
              {qText && (
                <button
                  onClick={() => setQText('')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-600 font-medium">
                  Showing <span className="text-blue-600 font-bold">{filtered.length}</span> {filtered.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((item) => (
                  // The `group` class here is used by the ItemCard's hover styles
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  >
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Floating Action Button */}
      <Link
        to="/report"
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 transform hover:scale-110 transition-all duration-300 z-50 group"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Report Lost Item
        </span>
      </Link>
    </div>
  );
}