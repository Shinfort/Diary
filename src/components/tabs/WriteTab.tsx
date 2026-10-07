"use client";

import React, { useState, useRef } from 'react';
import { PenTool, CheckCircle, Image as ImageIcon, Video as VideoIcon, X, UploadCloud, Link as LinkIcon } from 'lucide-react';

export default function WriteTab({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('Happy');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Compress and convert image to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Scale down max dimension to 1200px for optimal storage and performance
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setPhotos((prev) => [...prev, compressedDataUrl]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // Handle Video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // Limit video file to ~15MB for database storage safety
    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file video terlalu besar (maksimal 15MB). Anda juga dapat menempelkan link video YouTube / URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const videoData = event.target?.result as string;
      setVideos((prev) => [...prev, videoData]);
    };
    reader.readAsDataURL(file);

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Add Video URL (YouTube, Vimeo, direct MP4)
  const handleAddVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setVideos((prev) => [...prev, videoUrlInput.trim()]);
    setVideoUrlInput('');
    setShowVideoUrlInput(false);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          mood,
          photos,
          videos,
        }),
      });

      if (res.ok) {
        setTitle('');
        setContent('');
        setMood('Happy');
        setPhotos([]);
        setVideos([]);
        onSaveSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan catatan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menyimpan catatan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <PenTool size={24} style={{ color: 'var(--accent)' }} />
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)' }}>Tulis Catatan Harian</h2>
      </div>
      
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Judul Catatan
          </label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Beri judul untuk cerita atau memorimu hari ini..."
            required 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '1.1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        {/* Mood Select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suasana Hati (Mood)
          </label>
          <select 
            value={mood} 
            onChange={e => setMood(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '1rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              fontFamily: 'inherit'
            }}
          >
            <option value="Happy">Happy 😊 (Bahagia)</option>
            <option value="Peaceful">Peaceful 😌 (Tenang & Damai)</option>
            <option value="Excited">Excited 🤩 (Bersemangat)</option>
            <option value="Sad">Sad 😢 (Sedih)</option>
            <option value="Angry">Angry 😡 (Kesal / Marah)</option>
          </select>
        </div>

        {/* Content TextArea */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Isi Catatan (Dear Diary...)
          </label>
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Tuliskan pengalaman, perasaan, atau renunganmu hari ini..."
            required 
            rows={8}
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '1.1rem', 
              lineHeight: '1.7',
              fontFamily: 'var(--font-reading)',
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              resize: 'vertical' 
            }}
          />
        </div>

        {/* Media Attachments Section (Foto & Video) */}
        <div style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--foreground)' }}>
                Lampiran Foto & Video
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tersimpan langsung di database (aman & siap deploy Vercel)
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* Photo Upload Button */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ImageIcon size={16} style={{ color: 'var(--accent)' }} /> Tambah Foto
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />

              {/* Video Upload Button */}
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <VideoIcon size={16} style={{ color: '#2563eb' }} /> Upload Video
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />

              {/* Video URL Button */}
              <button
                type="button"
                onClick={() => setShowVideoUrlInput(!showVideoUrlInput)}
                style={{
                  padding: '8px 14px',
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <LinkIcon size={16} style={{ color: '#d97706' }} /> Link Video / YouTube
              </button>
            </div>
          </div>

          {/* Video URL Input Row */}
          {showVideoUrlInput && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input
                type="text"
                placeholder="Tempelkan link video YouTube atau link MP4..."
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  fontSize: '0.9rem',
                }}
              />
              <button
                type="button"
                onClick={handleAddVideoUrl}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                }}
              >
                Tambahkan
              </button>
            </div>
          )}

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Foto ({photos.length})
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '90px',
                      height: '90px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <img
                      src={photo}
                      alt={`preview ${idx}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Previews */}
          {videos.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Video ({videos.length})
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '180px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {vid.includes('youtube.com') || vid.includes('youtu.be') ? (
                      <div style={{ padding: '20px 10px', color: '#fff', fontSize: '0.75rem', textAlign: 'center' }}>
                        🎬 Video YouTube: {vid.substring(0, 30)}...
                      </div>
                    ) : (
                      <video src={vid} controls style={{ width: '100%', maxHeight: '110px' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '14px 28px', 
            fontSize: '1rem', 
            fontWeight: '600',
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            alignSelf: 'flex-start'
          }}
        >
          {loading ? 'Menyimpan Catatan...' : (
            <>
              <CheckCircle size={18} /> Simpan Catatan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
