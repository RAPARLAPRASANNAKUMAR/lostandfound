import { Link } from 'react-router-dom';

const isEmail = (v) => /\S+@\S+\.\S+/.test(String(v || ''));

export default function ItemCard({ item }) {
  const contact = item?.contact || item?.phone || item?.email || null;

  const href = (() => {
    if (!contact) return {};
    if (isEmail(contact)) return { email: `mailto:${contact}?subject=Regarding your lost item` };
    const digits = String(contact).replace(/[^\d+]/g, '');
    return {
      tel: `tel:${digits}`,
      wa: `https://wa.me/${digits.replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I saw your "${item?.name || 'lost item'}" on Find & Return.`)}`,
    };
  })();

  return (
    <Link to={`/items/${item.id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card hover:shadow-cardHover transition">
      {(item.imageUrl || item.imageBase64) && (
        <img src={item.imageUrl || item.imageBase64} alt={item.name || 'Lost item'} className="w-full aspect-square object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-lg font-display font-extrabold">{item.name || 'Lost item'}</h3>
        {item.location && <div className="text-slate-500 text-sm">{item.location}</div>}
        {item.description && <p className="text-slate-600 text-sm mt-2 line-clamp-2">{item.description}</p>}

        {contact && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {href.tel && (
              <a href={href.tel} onClick={(e) => e.stopPropagation()} className="inline-flex h-9 items-center rounded-full bg-emerald-500 px-4 text-white font-semibold shadow-sm hover:bg-emerald-400 transition">
                Call
              </a>
            )}
            {href.wa && (
              <a href={href.wa} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex h-9 items-center rounded-full bg-slate-900 px-4 text-white font-semibold hover:bg-slate-800 transition">
                WhatsApp
              </a>
            )}
            {href.email && (
              <a href={href.email} onClick={(e) => e.stopPropagation()} className="inline-flex h-9 items-center rounded-full bg-blue-600 px-4 text-white font-semibold hover:bg-blue-500 transition">
                Contact
              </a>
            )}
            <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(contact); }} className="inline-flex h-9 items-center rounded-full bg-white px-4 font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition">
              Copy
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}