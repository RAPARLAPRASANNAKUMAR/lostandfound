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

  // Calculate how recent the item is
  const getTimeAgo = () => {
    const t = item.approvedAt || item.createdAt || item.timestamp;
    if (!t) return null;
    const millis = typeof t === 'number' ? t : (t?.seconds ? t.seconds * 1000 : new Date(t).getTime());
    const now = Date.now();
    const diff = now - millis;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const timeAgo = getTimeAgo();
  const isRecent = (() => {
    const t = item.approvedAt || item.createdAt || item.timestamp;
    if (!t) return false;
    const millis = typeof t === 'number' ? t : (t?.seconds ? t.seconds * 1000 : new Date(t).getTime());
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return millis >= sevenDaysAgo;
  })();

  return (
    // This <Link> component is from the card you provided
    <Link to={`/items/${item.id}`} className="block h-full"> 
      <div className="relative h-full flex flex-col">
        {/* ...all the rest of your card's JSX... */}
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {(item.imageUrl || item.imageBase64) ? (
            <>
              <img 
                src={item.imageUrl || item.imageBase64} 
                alt={item.name || 'Lost item'} 
                className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            {isRecent && (
              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                NEW
              </span>
            )}
            {(item.imageUrl || item.imageBase64) && (
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold rounded-full shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Photo
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
              {item.name || 'Lost item'}
            </h3>
            {timeAgo && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeAgo}
              </div>
            )}
          </div>

          {item.location && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}

          {item.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
              {item.description}
            </p>
          )}

          {/* Contact Buttons */}
          {contact && (
            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {href.tel && (
                  <a
                    href={href.tel}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 min-w-[120px] text-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-500 transition"
                  >
                    Call
                  </a>
                )} 
                {href.wa && (
                  <a
                    href={href.wa}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 min-w-[120px] text-center px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-400 transition"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}