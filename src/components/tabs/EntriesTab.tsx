"use client";

import React, { useEffect, useState } from 'react';
import { Trash2, Calendar, BookOpen, Filter, X, Image as ImageIcon, Video as VideoIcon, User } from 'lucide-react';

type Entry = {
  id: number;
  title: string;
  content: string;
  mood: string;
  photos?: string[] | any;
  videos?: string[] | any;
  author_name?: string;
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

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch('/api/entries');
        const data = await res.json();
        if (res.ok) {
          setEntries(data.entries || []);
        }
      } catch (e) {
        console.error("Failed to fetch entries", e);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
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

                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDelete(entry.id, e)} 
                      style={{ 
                        color: '#ff4d4f', 
                        padding: '6px', 
                        borderRadius: '6px', 
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fff1f0'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Hapus Catatan"
                    >
                      <Trash2 size={16} />
                    </button>
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
    </div>
  );
}
