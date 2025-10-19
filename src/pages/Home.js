import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ItemCard from '../components/ItemCard'; // Importing ItemCard

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qText, setQText] = useState('');
  const [chip, setChip] = useState('all'); // 'all' | 'photo' | 'recent'

  // Subscribe to all docs and filter approved client-side
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'items'), // change if your collection is different
      (snap) => {
        const raw = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const isApproved = (i) => {
          const s = String(i.status || i.approvalStatus || '').toLowerCase();
          return i.isApproved === true || i.approved === true || s === 'approved' || s === 'hod-approved';
        };
        const approved = raw.filter(isApproved);
        console.debug('[Feed] raw:', raw.length, 'approved:', approved.length, approved.slice(0,3));
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

  // Utils to read and build contact links
  const getContactValue = (i) => i?.contact || i?.phone || i?.email || null;
  const buildContactHref = (value, item) => {
    if (!value) return null;
    const isEmail = /\S+@\S+\.\S+/.test(String(value));
    const msg = `Hi, I saw your "${item?.name || 'lost item'}" on Find & Return.`;
    if (isEmail) {
      return { email: `mailto:${value}?subject=${encodeURIComponent('Regarding your lost item')}&body=${encodeURIComponent(msg)}` };
    }
    const digits = String(value).replace(/[^\d+]/g, '');
    return {
      tel: `tel:${digits}`,
      wa: `https://wa.me/${digits.replace(/^\+/, '')}?text=${encodeURIComponent(msg)}`
    };
  };

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="text-center py-6">
        <h1 className="text-4xl font-bold text-gray-800">Public Lost Items</h1>
        <p className="text-gray-600 mt-2">See what’s missing. Help get things back to their owners.</p>

        <div className="mt-4 flex justify-center gap-4">
          <button className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${chip==='all'?'bg-blue-600 text-white':'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`} onClick={()=>setChip('all')}>All</button>
          <button className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${chip==='photo'?'bg-blue-600 text-white':'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`} onClick={()=>setChip('photo')}>With photo</button>
          <button className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${chip==='recent'?'bg-blue-600 text-white':'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`} onClick={()=>setChip('recent')}>Last 7 days</button>
        </div>

        <div className="mt-4 mx-auto w-full max-w-3xl">
          <div className="relative">
            <input
              value={qText}
              onChange={(e)=>setQText(e.target.value)}
              placeholder="Search item, location, or description"
              className="w-full h-12 rounded-full border border-gray-300 bg-white px-4 text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-400"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
            {qText && <button onClick={()=>setQText('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">Clear</button>}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {[...Array(6)].map((_,i)=>( 
            <div key={i} className="rounded-lg border border-gray-200 bg-white shadow-md animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))} 
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Nothing to show.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filtered.map(item => (
            <div key={item.id} className="rounded-lg border border-gray-200 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}