import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase'; // Import db only
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ReportForm() {
  const [itemName, setItemName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

  const fileToDataURL = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const downscaleToUnder5MB = async (file) => {
    // Draw to canvas and reduce size/quality progressively
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

    // Start with max side 1280 like social apps
    const maxSide = 1280;
    let { width, height } = img;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.85;
    let blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));

    // Reduce quality until under 5 MB or quality floor
    while (blob && blob.size > MAX_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
    }

    URL.revokeObjectURL(img.src);
    return blob;
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError('');

    if (!file.type.startsWith('image/')) {
      setFileError('Please select an image file.');
      return;
    }

    let blob = file;

    if (blob.size > MAX_BYTES) {
      // Try to shrink it
      try {
        blob = await downscaleToUnder5MB(file);
      } catch {
        setFileError('Unable to process image.');
        return;
      }
      if (!blob || blob.size > MAX_BYTES) {
        setFileError('Image too large. Max 5 MB.');
        return;
      }
    }

    const dataUrl = await fileToDataURL(blob);
    setImageBase64(dataUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageBase64) {
      alert('Please upload an image.');
      return;
    }
    setLoading(true);

    try {
      // 2. Add item data (with the Base64 string) to Firestore
      await addDoc(collection(db, 'items'), {
        name: itemName,
        location: location,
        description: description,
        contact: contactNumber,
        imageBase64: imageBase64, // <-- Save the string instead of a URL
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 3. Reset form
      alert('Report submitted for HOD approval!');
      setItemName(''); setLocation(''); setDescription('');
      setContactNumber(''); setImageBase64('');
      e.target.reset();
      
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to submit report. The image might be too large (max 1MB).');
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-container">
        <h2 className="form-title">Report a Lost Item</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Form groups are the same */}
          <div className="form-group">
            <label htmlFor="itemName">Item Name</label>
            <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location Lost</label>
            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="contactNumber">Your Contact Number</label>
            <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Photo (max 5 MB)</label>
            <input type="file" accept="image/*" onChange={handleFile} required />
            {fileError && <p className="muted" style={{ color: 'tomato' }}>{fileError}</p>}
            {imageBase64 && <img src={imageBase64} alt="preview" style={{ width: 160, borderRadius: 8, marginTop: 8 }} />}
          </div>
          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export default ReportForm;