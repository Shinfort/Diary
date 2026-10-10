"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Calendar, BookOpen, Filter, X, Image as ImageIcon, Video as VideoIcon, User, Pencil, CheckCircle, Link as LinkIcon } from 'lucide-react';

type Entry = {
  id: number;
  title: string;
  content: string;
  mood: string;
  photos?: string[] | any;
  videos?: string[] | any;
  author_name?: string;
  user_id?: number;
  created_at: string;
};

const MOODS = [
  { name: 'All', emoji: '🔍' },
  { name: 'Happy', emoji: '😊', bg: '#fef9c3', color: '#854d0e' },
  { name: 'Peaceful', emoji: '😌', bg: '#dcfce7', color: '#166534' },
  { name: 'Excited', emoji: '🤩', bg: '#ffe4e6', color: '#9f1239' },
  { name: 'Sad', emoji: '😢', bg: '#dbeafe', color: '#1e40af' },
  { name: 'Angry', emoji: '😡', bg: '#fee2e2', color: '#991b1b' },
];

export default function EntriesTab({ isAdmin }: { isAdmin: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('All');
  const [readingEntry, setReadingEntry] = useState<Entry | null>(null);
  const [previewMedia, setPreviewMedia] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; role?: string } | null>(null);

  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editMood, setEditMood] = useState('Happy');
  const [editPhotos, setEditPhotos] = useState<string[]>([]);
  const [editVideos, setEditVideos] = useState<string[]>([]);
  const [editVideoUrlInput, setEditVideoUrlInput] = useState('');
  const [showEditVideoUrlInput, setShowEditVideoUrlInput] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const editPhotoInputRef = useRef<HTMLInputElement>(null);
  const editVideoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [entriesRes, userRes] = await Promise.all([
          fetch('/api/entries'),
          fetch('/api/auth/me'),
        ]);

        const entriesData = await entriesRes.json();
        if (entriesRes.ok) {
          setEntries(entriesData.entries || []);
        }

        const userData = await userRes.json();
        if (userRes.ok && userData.authenticated && userData.user) {
          setCurrentUser(userData.user);
        }
      } catch (e) {
        console.error("Failed to fetch entries or user info", e);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return;
    try {
      const res = await fetch(`/api/entries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries(entries.filter(entry => entry.id !== id));
        if (readingEntry?.id === id) {
          setReadingEntry(null);
        }
      }
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleStartEdit = (entry: Entry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntry(entry);
    setEditTitle(entry.title);
    setEditContent(entry.content);
    setEditMood(entry.mood || 'Happy');
    setEditPhotos(getEntryPhotos(entry));
    setEditVideos(getEntryVideos(entry));
    setEditVideoUrlInput('');
    setShowEditVideoUrlInput(false);
    setEditError('');
  };

  const handleEditPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
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
            setEditPhotos((prev) => [...prev, compressedDataUrl]);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
  };

  const handleEditVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran file video terlalu besar (maksimal 15MB). Anda juga dapat menempelkan link video YouTube / URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const videoData = event.target?.result as string;
      setEditVideos((prev) => [...prev, videoData]);
    };
    reader.readAsDataURL(file);

    if (editVideoInputRef.current) editVideoInputRef.current.value = '';
  };

  const handleAddEditVideoUrl = () => {
    if (!editVideoUrlInput.trim()) return;
    setEditVideos((prev) => [...prev, editVideoUrlInput.trim()]);
    setEditVideoUrlInput('');
    setShowEditVideoUrlInput(false);
  };

  const removeEditPhoto = (index: number) => {
    setEditPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const removeEditVideo = (index: number) => {
    setEditVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setEditLoading(true);
    setEditError('');

    try {
      const res = await fetch('/api/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEntry.id,
          title: editTitle,
          content: editContent,
          mood: editMood,
          photos: editPhotos,
          videos: editVideos,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEntries((prev) => prev.map((entry) => 
          entry.id === editingEntry.id 
            ? { ...entry, title: editTitle, content: editContent, mood: editMood, photos: editPhotos, videos: editVideos }
            : entry
        ));
        if (readingEntry?.id === editingEntry.id) {
          setReadingEntry({
            ...readingEntry,
            title: editTitle,
            content: editContent,
            mood: editMood,
            photos: editPhotos,
            videos: editVideos,
          });
        }
        setEditingEntry(null);
      } else {
        setEditError(data.error || 'Gagal memperbarui catatan');
      }
    } catch (err) {
      setEditError('Terjadi kesalahan saat memperbarui catatan.');
    } finally {
      setEditLoading(false);
    }
  };

  const getEntryPhotos = (entry: Entry): string[] => {
    if (!entry.photos) return [];
    if (Array.isArray(entry.photos)) return entry.photos;
    if (typeof entry.photos === 'string') {
      try { return JSON.parse(entry.photos); } catch { return []; }
    }
    return [];
  };

  const getEntryVideos = (entry: Entry): string[] => {
    if (!entry.videos) return [];
    if (Array.isArray(entry.videos)) return entry.videos;
    if (typeof entry.videos === 'string') {
      try { return JSON.parse(entry.videos); } catch { return []; }
    }
    return [];
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  };

  const filteredEntries = selectedMood === 'All'
    ? entries
    : entries.filter(e => e.mood?.toLowerCase() === selectedMood.toLowerCase());

  const getMoodDetails = (moodName: string) => {
    return MOODS.find(m => m.name.toLowerCase() === (moodName || 'happy').toLowerCase()) || MOODS[1];
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Tab Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={24} style={{ color: 'var(--accent)' }} /> Linimasa Catatan
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
          {entries.length} {entries.length === 1 ? 'catatan' : 'catatan'} diterbitkan
        </span>
      </div>

      {/* Mood Filters */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
          <Filter size={14} /> Mood:
        </div>
        {MOODS.map(mood => (
          <button
            key={mood.name}
            onClick={() => setSelectedMood(mood.name)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '500',
              backgroundColor: selectedMood === mood.name ? 'var(--primary)' : 'var(--card-bg)',
              color: selectedMood === mood.name ? 'white' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: selectedMood === mood.name ? 'none' : 'var(--shadow-sm)',
            }}
          >
            <span>{mood.emoji}</span>
            <span>{mood.name}</span>
          </button>
        ))}
      </div>

      {/* Content Feed */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <p style={{ color: 'var(--text-muted)' }}>Memuat cerita...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', backgroundColor: 'var(--background)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '8px' }}>
            Belum ada catatan pada tampilan ini.
          </p>
          {selectedMood !== 'All' && (
            <button 
              onClick={() => setSelectedMood('All')}
              style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'underline', fontSize: '0.9rem' }}
            >
              Hapus filter
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredEntries.map(entry => {
            const moodInfo = getMoodDetails(entry.mood);
            const entryPhotos = getEntryPhotos(entry);
            const entryVideos = getEntryVideos(entry);
            const isAuthor = Boolean(currentUser && (Number(entry.user_id) === Number(currentUser.id)));
            const canEdit = Boolean(isAuthor || (currentUser && currentUser.role === 'admin') || isAdmin);
            const canDelete = Boolean(isAdmin || isAuthor || (currentUser && currentUser.role === 'admin'));

            return (
              <article 
                key={entry.id} 
                onClick={() => setReadingEntry(entry)}
                style={{ 
                  padding: '24px', 
                  backgroundColor: 'var(--card-bg)', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--foreground)', fontFamily: 'var(--font-reading)', lineHeight: '1.3' }}>
                      {entry.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(entry.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      {entry.author_name && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> {entry.author_name}
                        </span>
                      )}
                      {entry.mood && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '600', 
                          backgroundColor: moodInfo.bg || '#eee', 
                          color: moodInfo.color || '#333', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span>{moodInfo.emoji}</span>
                          <span>{entry.mood}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {(canEdit || canDelete) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      {canEdit && (
                        <button 
                          type="button"
                          onClick={(e) => handleStartEdit(entry, e)} 
                          style={{ 
                            color: 'var(--text-muted)', 
                            padding: '6px', 
                            borderRadius: '6px', 
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => { 
                            e.currentTarget.style.backgroundColor = 'var(--accent-light)'; 
                            e.currentTarget.style.color = 'var(--accent)'; 
                          }}
                          onMouseLeave={(e) => { 
                            e.currentTarget.style.backgroundColor = 'transparent'; 
                            e.currentTarget.style.color = 'var(--text-muted)'; 
                          }}
                          title="Edit Catatan"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(entry.id, e)} 
                          style={{ 
                            color: '#ff4d4f', 
                            padding: '6px', 
                            borderRadius: '6px', 
                            transition: 'var(--transition)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff1f0'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                          title="Hapus Catatan"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Content snippet */}
                <p style={{ 
                  fontSize: '1rem', 
                  color: 'var(--text-muted)', 
                  fontFamily: 'var(--font-reading)',
                  lineHeight: '1.6',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '10px'
                }}>
                  {entry.content}
                </p>

                {/* Media Preview Badges & Thumbnail Strip */}
                {(entryPhotos.length > 0 || entryVideos.length > 0) && (
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {entryPhotos.slice(0, 3).map((photo, i) => (
                      <div
                        key={i}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <img
                          src={photo}
                          alt="thumbnail"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}

                    {entryPhotos.length > 3 && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        +{entryPhotos.length - 3} foto lainnya
                      </span>
                    )}

                    {entryVideos.length > 0 && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        <VideoIcon size={12} /> {entryVideos.length} Video
                      </span>
                    )}
                  </div>
                )}

                {/* Read more button link */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Baca Selengkapnya →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Reader overlay modal (Medium style) */}
      {readingEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header info */}
            <div style={{ 
              padding: '24px 30px', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              gap: '20px'
            }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--foreground)', fontFamily: 'var(--font-reading)', lineHeight: '1.25', marginBottom: '8px' }}>
                  {readingEntry.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {new Date(readingEntry.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  {readingEntry.author_name && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> Ditulis oleh {readingEntry.author_name}
                    </span>
                  )}
                  {readingEntry.mood && (
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: '600', 
                      backgroundColor: getMoodDetails(readingEntry.mood).bg || '#eee', 
                      color: getMoodDetails(readingEntry.mood).color || '#333', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <span>{getMoodDetails(readingEntry.mood).emoji}</span>
                      <span>{readingEntry.mood}</span>
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setReadingEntry(null)}
                style={{ 
                  color: 'var(--text-muted)', 
                  padding: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content view with rich serif reading styles & media */}
            <div style={{ 
              padding: '30px', 
              overflowY: 'auto', 
              flex: 1, 
              backgroundColor: '#fdfbf9' 
            }}>
              <p style={{ 
                fontSize: '1.15rem', 
                lineHeight: '1.8', 
                color: '#242424', 
                fontFamily: 'var(--font-reading)', 
                whiteSpace: 'pre-wrap',
                marginBottom: '24px',
              }}>
                {readingEntry.content}
              </p>

              {/* Photos Gallery */}
              {getEntryPhotos(readingEntry).length > 0 && (
                <div style={{ marginTop: '24px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Galeri Foto ({getEntryPhotos(readingEntry).length})
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {getEntryPhotos(readingEntry).map((photo, i) => (
                      <div
                        key={i}
                        onClick={() => setPreviewMedia(photo)}
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          aspectRatio: '16/10',
                        }}
                      >
                        <img
                          src={photo}
                          alt={`photo ${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Player */}
              {getEntryVideos(readingEntry).length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Video ({getEntryVideos(readingEntry).length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {getEntryVideos(readingEntry).map((vid, i) => {
                      const ytUrl = getYouTubeEmbedUrl(vid);
                      if (ytUrl) {
                        return (
                          <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', aspectRatio: '16/9', border: '1px solid var(--border)' }}>
                            <iframe
                              src={ytUrl}
                              title={`YouTube video ${i}`}
                              style={{ width: '100%', height: '100%', border: 'none' }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', backgroundColor: '#000' }}>
                          <video src={vid} controls style={{ width: '100%', maxHeight: '400px' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={previewMedia}
            alt="zoom preview"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Edit Note Modal */}
      {editingEntry && (
        <div 
          onClick={() => setEditingEntry(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1050,
            padding: '20px',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--card-bg)',
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pencil size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--foreground)' }}>
                  Edit Catatan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                style={{
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--background)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateEntry} style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {editError && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '0.9rem' }}>
                  {editError}
                </div>
              )}

              {/* Title input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Judul Catatan
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Judul catatan..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Mood select */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Suasana Hati (Mood)
                </label>
                <select
                  value={editMood}
                  onChange={(e) => setEditMood(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="Happy">Happy 😊 (Bahagia)</option>
                  <option value="Peaceful">Peaceful 😌 (Tenang & Damai)</option>
                  <option value="Excited">Excited 🤩 (Bersemangat)</option>
                  <option value="Sad">Sad 😢 (Sedih)</option>
                  <option value="Angry">Angry 😡 (Kesal / Marah)</option>
                </select>
              </div>

              {/* Content textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Isi Catatan
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Tuliskan catatanmu..."
                  required
                  rows={7}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    fontFamily: 'var(--font-reading)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Media Attachments Section */}
              <div style={{
                backgroundColor: 'var(--background)',
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
                      Kelola media untuk catatan ini
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Add Photo */}
                    <button
                      type="button"
                      onClick={() => editPhotoInputRef.current?.click()}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <ImageIcon size={15} style={{ color: 'var(--accent)' }} /> Tambah Foto
                    </button>
                    <input
                      ref={editPhotoInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEditPhotoUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Add Video */}
                    <button
                      type="button"
                      onClick={() => editVideoInputRef.current?.click()}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <VideoIcon size={15} style={{ color: '#2563eb' }} /> Upload Video
                    </button>
                    <input
                      ref={editVideoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleEditVideoUpload}
                      style={{ display: 'none' }}
                    />

                    {/* Link Video */}
                    <button
                      type="button"
                      onClick={() => setShowEditVideoUrlInput(!showEditVideoUrlInput)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <LinkIcon size={15} style={{ color: '#d97706' }} /> Link Video
                    </button>
                  </div>
                </div>

                {/* Video URL Input */}
                {showEditVideoUrlInput && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="text"
                      placeholder="Tempelkan link video YouTube atau link MP4..."
                      value={editVideoUrlInput}
                      onChange={(e) => setEditVideoUrlInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card-bg)',
                        fontSize: '0.85rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddEditVideoUrl}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Tambah
                    </button>
                  </div>
                )}

                {/* Edit Photo Previews */}
                {editPhotos.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Foto ({editPhotos.length})
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {editPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <img
                            src={photo}
                            alt={`edit preview ${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEditPhoto(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              border: 'none',
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

                {/* Edit Video Previews */}
                {editVideos.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Video ({editVideos.length})
                    </span>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {editVideos.map((vid, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '160px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {vid.includes('youtube.com') || vid.includes('youtu.be') ? (
                            <div style={{ padding: '16px 8px', color: '#fff', fontSize: '0.75rem', textAlign: 'center' }}>
                              🎬 YouTube: {vid.substring(0, 25)}...
                            </div>
                          ) : (
                            <video src={vid} controls style={{ width: '100%', maxHeight: '100px' }} />
                          )}
                          <button
                            type="button"
                            onClick={() => removeEditVideo(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              border: 'none',
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

              {/* Action Buttons in Modal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-muted)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    opacity: editLoading ? 0.7 : 1,
                  }}
                >
                  {editLoading ? 'Menyimpan...' : (
                    <>
                      <CheckCircle size={16} /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
