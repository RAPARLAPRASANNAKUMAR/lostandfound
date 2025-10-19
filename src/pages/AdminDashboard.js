import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Animation variants
const containerVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { duration: 0.3 } },
};

function AdminDashboard() {
  const [pendingItems, setPendingItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]); // NEW

  useEffect(() => {
    // Pending
    const qPending = query(collection(db, 'items'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, (querySnapshot) => {
      const itemsData = [];
      querySnapshot.forEach((doc) => itemsData.push({ ...doc.data(), id: doc.id }));
      setPendingItems(itemsData);
    });

    // Approved (public feed)
    const qApproved = query(collection(db, 'items'), where('status', '==', 'approved'));
    const unsubApproved = onSnapshot(qApproved, (querySnapshot) => {
      const itemsData = [];
      querySnapshot.forEach((doc) => itemsData.push({ ...doc.data(), id: doc.id }));
      setApprovedItems(itemsData);
    });

    return () => {
      unsubPending();
      unsubApproved();
    };
  }, []);

  const handleApprove = async (id) => {
    const itemRef = doc(db, 'items', id);
    try {
      await updateDoc(itemRef, { status: 'approved' });
      alert('Item approved!');
    } catch (error) {
      console.error("Error approving item: ", error);
      alert('Failed to approve item.');
    }
  };

  const handleReject = async (id) => {
    const itemRef = doc(db, 'items', id);
    if (window.confirm("Reject and delete this item?")) {
      try {
        await deleteDoc(itemRef);
        alert('Item rejected and deleted.');
      } catch (error) {
        console.error("Error rejecting item: ", error);
      }
    }
  };

  const handleMarkFound = async (id) => {
    const itemRef = doc(db, 'items', id);
    if (window.confirm("Mark as found? It will be hidden from public feed.")) {
      try {
        await updateDoc(itemRef, { status: 'found' });
        alert('Item marked as found.');
      } catch (error) {
        console.error("Error marking found: ", error);
        alert('Failed to update.');
      }
    }
  };

  const approveItem = async (item) => {
    try {
      // 1) Persist the approval (adjust URL/body to your API)
      await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          status: 'approved',
          approvedAt: Date.now()
        })
      });

      // 2) Optimistic UI update (if you hold local state)
      setItems(prev =>
        prev.map(i => i.id === item.id ? { ...i, status: 'approved', approvedAt: Date.now() } : i)
      );

      // 3) Tell the feed to refresh
      window.dispatchEvent(new Event('items:refresh'));
    } catch (e) {
      console.error('Approve failed', e);
      alert('Failed to approve item');
    }
  };

  return (
    <div className="page">
      <header className="admin-header">
        <h1 className="admin-title">Moderation</h1>
        <p className="admin-sub">Approve valid reports. Hide items when returned.</p>
      </header>

      <section className="section-card">
        <h2 className="section-title">Pending approval</h2>
        {pendingItems.length === 0 ? (
          <p className="empty-message">No items are pending approval.</p>
        ) : (
          <div className="admin-list">
            {pendingItems.map(item => (
              <div key={item.id} className="admin-card">
                <img src={item.imageBase64 || item.imageUrl} alt={item.name} className="admin-card-image" />
                <div className="admin-card-body">
                  <h3>{item.name}</h3>
                  <p className="muted">Location: {item.location || '—'}</p>
                  <p className="muted">Contact: {item.contact || item.phone || item.email || '—'}</p>
                  {item.description && <p style={{ marginTop: 6 }}>{item.description}</p>}
                  <div className="admin-card-actions">
                    <button onClick={() => handleApprove(item.id)} className="btn btn-green">Approve</button>
                    <button onClick={() => handleReject(item.id)} className="btn btn-red">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section-card">
        <h2 className="section-title">Approved (Public)</h2>
        {approvedItems.length === 0 ? (
          <p className="empty-message">No approved items.</p>
        ) : (
          <div className="admin-list">
            {approvedItems.map(item => (
              <div key={item.id} className="admin-card">
                <img src={item.imageBase64 || item.imageUrl} alt={item.name} className="admin-card-image" />
                <div className="admin-card-body">
                  <h3>{item.name}</h3>
                  <p className="muted">Location: {item.location || '—'}</p>
                  <p className="muted">Contact: {item.contact || item.phone || item.email || '—'}</p>
                  {item.description && <p style={{ marginTop: 6 }}>{item.description}</p>}
                  <div className="admin-card-actions">
                    <button onClick={() => handleMarkFound(item.id)} className="btn btn-green">Mark as Found</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;