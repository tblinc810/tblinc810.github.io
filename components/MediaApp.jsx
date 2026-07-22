"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, Film, ChevronRight, Home, AlertCircle, Play, ArrowLeft, Search, Bell, User, Menu, LogOut, Download, Sun, Moon, MonitorPlay, Sparkles, Ghost, Video, Languages, Trophy, Tv, Clapperboard, MonitorSmartphone, Star, Gamepad2, Disc3, Globe2 } from 'lucide-react';
import { fetchDirectory, getFullUrl, fetchStatus } from '../lib/api';
import AuthModal from './AuthModal';
import { auth, signOut } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import dynamic from 'next/dynamic';
import 'plyr-react/plyr.css';

const Plyr = dynamic(() => import('plyr-react').then(mod => mod.Plyr || mod.default), { ssr: false });
const Thumbnail = ({ item }) => {
  const [images, setImages] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [fetchDone, setFetchDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (item.isFolder) {
      fetchDirectory(item.href).then(async data => {
        if (!isMounted) return;
        let imgs = data
          .filter(f => !f.isFolder && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.href))
          .slice(0, 6)
          .map(f => getFullUrl(f.href));

        if (imgs.length === 0) {
          const subfolders = data.filter(f => f.isFolder);
          const maxToCheck = Math.min(4, subfolders.length);
          const fetchPromises = subfolders.slice(0, maxToCheck).map(sub => fetchDirectory(sub.href).catch(() => []));
          const subResults = await Promise.all(fetchPromises);

          if (!isMounted) return;
          subResults.forEach(subData => {
            const sImgs = subData
              .filter(f => !f.isFolder && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.href))
              .map(f => getFullUrl(f.href));
            if (sImgs.length > 0) imgs.push(sImgs[0]);
          });
        }

        setImages(imgs);
        setFetchDone(true);
      }).catch(() => {
        if (isMounted) setFetchDone(true);
      });
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(item.href)) {
      setImages([getFullUrl(item.href)]);
      setFetchDone(true);
    } else {
      setFetchDone(true);
    }
    return () => { isMounted = false; };
  }, [item.href, item.isFolder]);

  // Auto-slide through images
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setActiveImg(i => (i + 1) % images.length), 2200);
    return () => clearInterval(t);
  }, [images.length]);

  if (!fetchDone) {
    return <div style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />;
  }

  if (images.length > 0) {
    return (
      <>
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImg}
            src={images[activeImg]}
            alt={item.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
        </AnimatePresence>
        {/* Dot indicators if multiple images */}
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 2 }}>
            {images.map((_, i) => (
              <div key={i} style={{ width: i === activeImg ? '12px' : '5px', height: '5px', borderRadius: '3px', background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s ease' }} />
            ))}
          </div>
        )}
      </>
    );
  }

  return item.isFolder ? <Folder size={40} /> : <Play size={40} />;
};


const HeroSlider = ({ onPlay }) => {
  const featuredPath = '/DHAKA-FLIX-7/English Movies/(2024)/';
  const [slides, setSlides] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    fetchDirectory(featuredPath).then(async (folders) => {
      const picked = folders.filter(f => f.isFolder).slice(0, 8);
      const results = await Promise.all(
        picked.map(async (folder) => {
          try {
            const files = await fetchDirectory(folder.href);
            const img = files.find(f => !f.isFolder && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.href));
            const video = files.find(f => !f.isFolder && /\.(mp4|mkv|avi|webm|m4v)$/i.test(f.href));
            return img ? { title: folder.title, img: getFullUrl(img.href), video: video || null, href: folder.href } : null;
          } catch { return null; }
        })
      );
      setSlides(results.filter(Boolean));
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setActiveIdx(i => (i + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[activeIdx];

  return (
    <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '20px', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <img src={slide.img} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,10,25,0.92) 35%, rgba(5,10,25,0.2) 100%)' }} />
          {/* Movie info */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '2.5rem', maxWidth: '55%' }}>
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}
            >Featured Film</motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ margin: '0 0 1.25rem', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
            >{slide.title}</motion.h2>
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              onClick={() => slide.video && onPlay(slide.video)}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--accent-color)', border: 'none', color: '#fff', padding: '0.75rem 1.75rem', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(139,92,246,0.5)' }}
            >
              <Play size={18} fill="white" /> Play Now
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot navigation */}
      <div style={{ position: 'absolute', bottom: '1.25rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)} style={{
            width: i === activeIdx ? '24px' : '8px', height: '8px',
            borderRadius: '4px', border: 'none', cursor: 'pointer',
            background: i === activeIdx ? 'var(--accent-color)' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.3s ease', padding: 0
          }} />
        ))}
      </div>

      {/* Arrow buttons */}
      {['left', 'right'].map(dir => (
        <button key={dir} onClick={() => setActiveIdx(i => dir === 'left' ? (i - 1 + slides.length) % slides.length : (i + 1) % slides.length)}
          style={{ position: 'absolute', top: '50%', [dir]: '1rem', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
        >{dir === 'left' ? '‹' : '›'}</button>
      ))}
    </div>
  );
};

const LIBRARIES = [
  { icon: <Film size={18} />, label: 'English Movies', path: '/DHAKA-FLIX-7/English Movies/' },
  { icon: <MonitorPlay size={18} />, label: 'TV & Web Series', path: '/DHAKA-FLIX-12/TV-WEB-Series/' },
  { icon: <Sparkles size={18} />, label: 'Animation (1080p)', path: '/DHAKA-FLIX-14/Animation Movies (1080p)/' },
  { icon: <Ghost size={18} />, label: 'Animation Movies', path: '/DHAKA-FLIX-14/Animation Movies/' },
  { icon: <Video size={18} />, label: 'English (1080p)', path: '/DHAKA-FLIX-14/English Movies (1080p)/' },
  { icon: <Languages size={18} />, label: 'Hindi Movies', path: '/DHAKA-FLIX-14/Hindi Movies/' },
  { icon: <Trophy size={18} />, label: 'IMDb Top-250', path: '/DHAKA-FLIX-14/IMDb Top-250 Movies/' },
  { icon: <Tv size={18} />, label: 'Korean TV & Series', path: '/DHAKA-FLIX-14/KOREAN TV & WEB Series/' },
  { icon: <Clapperboard size={18} />, label: 'South Indian (Hindi)', path: '/DHAKA-FLIX-14/SOUTH INDIAN MOVIES/Hindi Dubbed/' },
  { icon: <MonitorSmartphone size={18} />, label: 'South Indian Movies', path: '/DHAKA-FLIX-14/SOUTH INDIAN MOVIES/South Movies/' },
  { icon: <Star size={18} />, label: 'Kolkata Bangla', path: '/DHAKA-FLIX-7/Kolkata Bangla Movies/' },
  { icon: <Gamepad2 size={18} />, label: 'PC Games', path: '/DHAKA-FLIX-8/PC Games/' },
  { icon: <Disc3 size={18} />, label: '3D Movies', path: '/DHAKA-FLIX-7/3D Movies/' },
  { icon: <Globe2 size={18} />, label: 'Foreign Language', path: '/DHAKA-FLIX-7/Foreign Language Movies/' },
];

const NOTIFICATIONS = [
  { id: 1, title: 'New Movie Added', text: 'Inception is now available in 1080p.', time: '2m ago' },
  { id: 2, title: 'Welcome to tblinc v1', text: 'Enjoy premium movie streaming for free.', time: '1d ago' },
];

const App = () => {
  const [rootPath, setRootPath] = useState('/DHAKA-FLIX-7/English Movies/');
  const [currentPath, setCurrentPath] = useState('/DHAKA-FLIX-7/English Movies/');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalIsLogin, setAuthModalIsLogin] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => typeof window !== "undefined" ? localStorage.getItem('theme') || 'dark' : 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [mounted, setMounted] = useState(false);

  // A stack to keep track of navigation history
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchStatus().then(data => setBackendStatus(data));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadDirectory(currentPath);
    setSearchQuery(''); // clear search when navigating
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const loadDirectory = async (path, retries = 2) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDirectory(path);
      setItems(data);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => loadDirectory(path, retries - 1), 1500);
        return;
      }
      const isServerError =
        err?.code === 'ERR_NETWORK' ||
        err?.message?.includes('Network Error') ||
        err?.response?.status === 404 ||
        err?.response?.status >= 500 ||
        err?.code === 'ERR_BAD_RESPONSE' ||
        !err?.response;
      setError(isServerError ? 'SERVER_OFFLINE' : 'Failed to load directory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLibraryChange = (newPath) => {
    setRootPath(newPath);
    setHistory([]);
    setCurrentPath(newPath);
    setCurrentMovie(null);
  };

  const handleGoBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousPath = newHistory.pop();
      setHistory(newHistory);
      setCurrentPath(previousPath);
    }
  };

  const handleFolderClick = async (path) => {
    setLoading(true);
    try {
      const data = await fetchDirectory(path);
      const videoExtensions = ['.mp4', '.mkv', '.avi', '.webm', '.m4v'];
      const videoFiles = data.filter(item => !item.isFolder && videoExtensions.some(ext => item.href.toLowerCase().endsWith(ext)));
      const subfolders = data.filter(item => item.isFolder);

      // Direct play only if there is exactly 1 video file and no subfolders to browse
      if (videoFiles.length === 1 && subfolders.length === 0) {
        setCurrentMovie(videoFiles[0]);
      } else {
        // Navigate normally into the directory
        setHistory(prev => [...prev, currentPath]);
        setCurrentPath(path);
        setCurrentMovie(null);
      }
    } catch {
      // Fallback: navigate directly to path on error
      setHistory(prev => [...prev, currentPath]);
      setCurrentPath(path);
      setCurrentMovie(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    setHistory([]);
    setCurrentPath(rootPath);
    setCurrentMovie(null);
  };

  const handleFileClick = (item) => {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.webm', '.m4v'];
    const isVideo = videoExtensions.some(ext => item.href.toLowerCase().endsWith(ext));

    if (isVideo) {
      setCurrentMovie(item);
    } else {
      window.open(getFullUrl(item.href), '_blank');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="app-layout">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultIsLogin={authModalIsLogin} />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'space-between', marginBottom: '0.5rem' }}>
          <div className="sidebar-brand">
            <Film size={28} color="var(--accent-color)" style={{ flexShrink: 0 }} />
            <span className="sidebar-brand-label" style={{ fontSize: '1.4rem', fontWeight: 700 }}>tblinc v1</span>
          </div>
        </div>
        {!sidebarCollapsed && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0' }}>Premium Movie Archive</p>}

        <div className="sidebar-nav" style={{ marginTop: '1.5rem' }}>
          {/* Libraries section */}
          {!sidebarCollapsed && (
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 700, padding: '0 0.5rem', marginBottom: '0.25rem' }}>
              Libraries
            </p>
          )}
          {LIBRARIES.map(lib => {
            const isActive = rootPath === lib.path;
            return (
              <div
                key={lib.path}
                className={`sidebar-link${isActive ? ' active' : ''}`}
                onClick={() => handleLibraryChange(lib.path)}
                title={sidebarCollapsed ? lib.label : ''}
                style={{
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.06) 100%)'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  paddingLeft: '0.75rem',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ flexShrink: 0, fontSize: '1.05rem', lineHeight: 1 }}>{lib.icon}</span>
                <span className="sidebar-link-label">{lib.label}</span>
              </div>
            );
          })}

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">

        {/* Top Navbar */}
        <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: Sidebar toggle and Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <button className="toggle-btn" onClick={() => setSidebarCollapsed(prev => !prev)} title="Toggle Sidebar">
              <Menu size={20} />
            </button>
            <div className="search-bar" style={{ width: '100%', maxWidth: '300px' }}>
              <Search size={18} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}>✕</button>
              )}
            </div>
          </div>

          {/* Center: Links */}
          {/* Right: Notifications & Profile */}
          <div style={{ display: 'flex', gap: '1.25rem', color: 'var(--text-secondary)', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
              title={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Switch theme'}
            >
              {mounted ? (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />) : <Sun size={20} />}
            </button>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <Bell size={20} />
                <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--danger-color)', borderRadius: '50%' }}></span>
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="glass"
                    style={{
                      position: 'absolute', top: '150%', right: -10, width: '320px', padding: '1rem',
                      display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 100,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.5)', borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }}>Mark all read</span>
                    </div>
                    {NOTIFICATIONS.map(n => (
                      <div key={n.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface-border)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{n.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{n.time}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.text}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email || 'User'}&background=3b82f6&color=fff`}
                    alt="User"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--accent-color)' }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  title="Sign Out"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => { setAuthModalIsLogin(true); setAuthModalOpen(true); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer', padding: '0.5rem' }}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setAuthModalIsLogin(false); setAuthModalOpen(true); }}
                  style={{ background: 'var(--accent-color)', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', padding: '0.5rem 1.25rem', borderRadius: '50px', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'all 0.2s' }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="main-content-inner">
          {/* Hero Slider – only show on English Movies home page */}
          {currentPath === '/DHAKA-FLIX-7/English Movies/' && !currentMovie && (
            <HeroSlider onPlay={(videoItem) => setCurrentMovie(videoItem)} />
          )}

          <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleGoHome}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Home size={20} />
            </button>
            <ChevronRight size={16} color="var(--text-secondary)" />
            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {currentPath === rootPath
                ? 'Home'
                : decodeURIComponent(currentPath).replace(rootPath, '').replace(/\/$/, '')}
            </div>

            {history.length > 0 && (
              <button
                onClick={handleGoBack}
                style={{
                  marginLeft: 'auto',
                  background: 'var(--surface-border)',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <ArrowLeft size={20} /> Go Back
              </button>
            )}
          </div>

          {loading ? (
            <div className="loader"></div>
          ) : error ? (
            error === 'SERVER_OFFLINE' ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 1rem', textAlign: 'center' }}
              >
                {/* Hero icon */}
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px var(--accent-glow)' }}>
                  <Film size={48} color="#fff" />
                </div>

                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0 0 0.5rem', letterSpacing: '-0.03em' }}>tblinc v1</h1>
                  <p style={{ color: 'var(--accent-color)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Premium Private Movie Server</p>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.8 }}>
                  This is a <strong style={{ color: 'var(--text-primary)' }}>private media streaming platform</strong> accessible only on the local network. Connect to the network to stream thousands of movies, TV shows, and more.
                </p>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: '600px' }}>
                  {[
                    { icon: <Film size={22} />, label: 'Movies', desc: 'English, Hindi, South Indian & more' },
                    { icon: <MonitorPlay size={22} />, label: 'TV Series', desc: 'Web series & Korean dramas' },
                    { icon: <Trophy size={22} />, label: 'IMDb Top 250', desc: 'Best rated movies of all time' },
                  ].map(f => (
                    <div key={f.label} className="glass" style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ color: 'var(--accent-color)' }}>{f.icon}</div>
                      <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>{f.label}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="glass" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '12px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger-color)', flexShrink: 0, boxShadow: '0 0 8px var(--danger-color)' }}></div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Media server offline — <strong style={{ color: 'var(--text-primary)' }}>connect to local network to stream</strong></span>
                </div>

                <button
                  onClick={() => loadDirectory(currentPath)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', padding: '0.5rem 1.25rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  ↺ Retry Connection
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}
              >
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={36} color="var(--danger-color)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Something Went Wrong</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '380px', lineHeight: 1.6 }}>{error}</p>
                </div>
                <button
                  onClick={() => loadDirectory(currentPath)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-color)', border: 'none', color: '#fff', padding: '0.65rem 1.5rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}
                >
                  ↺ Retry
                </button>
              </motion.div>
            )
          ) : currentMovie ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Player header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setCurrentMovie(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-border)', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, flexShrink: 0 }}
                >
                  <ArrowLeft size={18} /> Back
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Now Playing</p>
                  <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={currentMovie.title}>
                    {currentMovie.title}
                  </h2>
                </div>
                <a
                  href={getFullUrl(currentMovie.href)}
                  download={currentMovie.title}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-color)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textDecoration: 'none', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
                >
                  <Download size={18} /> Download
                </a>
              </div>

              <div className="video-player-container" style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px' }}>
                <Plyr
                  source={{
                    type: 'video',
                    sources: [
                      {
                        src: getFullUrl(currentMovie.href)
                      }
                    ]
                  }}
                  options={{
                    autoplay: true,
                    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
                  }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {(() => {
                const filtered = items.filter(item =>
                  item.title.toLowerCase().includes(searchQuery.toLowerCase())
                );
                return filtered.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    {searchQuery ? `No results for "${searchQuery}"` : 'No items found in this directory.'}
                  </div>
                ) : filtered.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={itemVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    className="glass"
                    style={{ padding: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative', overflow: 'hidden' }}
                    onClick={() => item.isFolder ? handleFolderClick(item.href) : handleFileClick(item)}
                  >
                    {/* Thumbnail box */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', borderRadius: '10px', overflow: 'hidden', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                      <Thumbnail item={item} />
                      {/* Hover play overlay */}
                      <motion.div
                        variants={{ hover: { opacity: 1 }, rest: { opacity: 0 } }}
                        initial="rest"
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}
                      >
                        <div style={{ background: 'var(--accent-color)', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(59,130,246,0.6)' }}>
                          <Play size={24} fill="white" color="white" />
                        </div>
                      </motion.div>
                    </div>
                    {/* Title */}
                    <div style={{ width: '100%' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.title}>
                        {item.title}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>
                        {item.date || ''}
                      </p>
                    </div>
                  </motion.div>
                ))
              })()
              }
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2.5rem', padding: '2.5rem 2rem', borderBottom: '1px solid var(--surface-border)' }}>

            {/* Col 1 — Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Film size={22} color="var(--accent-color)" />
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>tblinc v1</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>
                Your premium movie archive — stream thousands of titles across every genre, language, and era.
              </p>
            </div>

            {/* Col 2 — Explore */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Explore</p>
              {[
                { label: '🎬 English Movies', path: '/DHAKA-FLIX-7/English Movies/' },
                { label: '📺 TV & Web Series', path: '/DHAKA-FLIX-12/TV-WEB-Series/' },
                { label: '🏆 IMDb Top-250', path: '/DHAKA-FLIX-14/IMDb Top-250 Movies/' },
                { label: '✨ Animation (1080p)', path: '/DHAKA-FLIX-14/Animation Movies (1080p)/' },
              ].map(item => (
                <span
                  key={item.path}
                  onClick={() => handleLibraryChange(item.path)}
                  style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{item.label}</span>
              ))}
            </div>

            {/* Col 3 — Languages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Languages</p>
              {[
                { label: '🇮🇳 Hindi Movies', path: '/DHAKA-FLIX-14/Hindi Movies/' },
                { label: '🇰🇷 Korean TV & Series', path: '/DHAKA-FLIX-14/KOREAN TV & WEB Series/' },
                { label: '🎭 South Indian', path: '/DHAKA-FLIX-14/SOUTH INDIAN MOVIES/South Movies/' },
                { label: '🌐 Foreign Language', path: '/DHAKA-FLIX-7/Foreign Language Movies/' },
              ].map(item => (
                <span
                  key={item.path}
                  onClick={() => handleLibraryChange(item.path)}
                  style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{item.label}</span>
              ))}
            </div>

            {/* Col 4 — More */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>More</p>
              {[
                { label: '🇧🇩 Kolkata Bangla', path: '/DHAKA-FLIX-7/Kolkata Bangla Movies/' },
                { label: '🐣 Animation', path: '/DHAKA-FLIX-14/Animation Movies/' },
                { label: '🎮 PC Games', path: '/DHAKA-FLIX-8/PC Games/' },
                { label: '📀 3D Movies', path: '/DHAKA-FLIX-7/3D Movies/' },
              ].map(item => (
                <span
                  key={item.path}
                  onClick={() => handleLibraryChange(item.path)}
                  style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >{item.label}</span>
              ))}
            </div>

          </div>

          {/* Bottom bar */}
          <div className="footer-bottom" style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
              © {new Date().getFullYear()} tblinc v1 · Premium Movie Archive
            </p>
            {backendStatus && (
              <p style={{ color: backendStatus.status === 'online' ? '#10b981' : '#ef4444', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }}></span>
                {backendStatus.message}
              </p>
            )}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Film size={14} /> All servers online
            </p>
          </div>
        </footer>
      </main>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="mobile-tabs">
        <button
          className={`mobile-tab-btn ${currentPath === rootPath && !currentMovie && !searchQuery ? 'active' : ''}`}
          onClick={handleGoHome}
        >
          <Home size={22} />
          Home
        </button>
        <button
          className={`mobile-tab-btn ${searchQuery ? 'active' : ''}`}
          onClick={() => {
            setCurrentMovie(null);
            setTimeout(() => document.querySelector('.search-bar input')?.focus(), 100);
          }}
        >
          <Search size={22} />
          Search
        </button>
        <button
          className="mobile-tab-btn"
          onClick={() => {
            // Cycle through first library
            handleLibraryChange(LIBRARIES[0].path);
          }}
        >
          <Film size={22} />
          Libraries
        </button>
        <button
          className="mobile-tab-btn"
          onClick={() => {
            if (user) signOut(auth);
            else { setAuthModalIsLogin(true); setAuthModalOpen(true); }
          }}
        >
          <User size={22} />
          {user ? 'Sign Out' : 'Sign In'}
        </button>
      </nav>
    </div>
  );
};

export default App;
