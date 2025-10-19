import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const ref = doc(db, 'items', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setNotFound(true);
        return;
      }
      const data = snap.data();
      // Only show publicly if approved
      if (data.status !== 'approved') {
        setNotFound(true);
        return;
      }
      setItem({ id: snap.id, ...data });
    })();
  }, [id]);

  if (notFound) {
    return (
      <div className="container">
        <p className="empty-message">Item not found.</p>
        <button className="btn" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!item) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <Link to="/" className="btn btn-link">← Back to list</Link>
      <div className="detail-card">
        <img
          src={item.imageBase64 || item.imageUrl}
          alt={item.name}
          className="detail-image"
        />
        <div className="detail-body">
          <h2>{item.name}</h2>
          <p><strong>Location:</strong> {item.location || '—'}</p>
          <p><strong>Description:</strong> {item.description || '—'}</p>
          <p><strong>Reported by:</strong> {item.reporterName || '—'}</p>
          <p><strong>Contact:</strong> {item.contact || item.phone || item.email || '—'}</p>
          {item.dateLost && <p><strong>Date lost:</strong> {item.dateLost}</p>}
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;