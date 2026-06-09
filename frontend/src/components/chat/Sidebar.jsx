import { useState, useEffect, useRef } from 'react';
import { Search, Users, LogOut, MessageCircle, X, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';

export default function Sidebar({ chats, setChats, selectedChat, setSelectedChat, unreadCounts }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/auth/search?search=${search}`);
        setSearchResults(data);
      } catch { /**/ }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const openDM = async (userId) => {
    try {
      const { data } = await api.post('/chats', { userId });
      setSearch(''); setSearchResults([]);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
    } catch (err) { toast.error(err.response?.data?.message || 'Could not open chat'); }
  };

  const getChatName   = (c) => c.isGroupChat ? c.name : c.participants.find((p) => p._id !== user._id)?.username || 'Unknown';
  const getChatAvatar = (c) => c.isGroupChat ? null : c.participants.find((p) => p._id !== user._id)?.avatar || null;
  const isOnline      = (c) => { if (c.isGroupChat) return false; const o = c.participants.find((p) => p._id !== user._id); return onlineUsers.includes(o?._id); };

  const formatTime = (d) => {
    const date = new Date(d); const now = new Date();
    if (date.toDateString() === now.toDateString())
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full w-full relative"
      style={{ background: 'rgba(12, 14, 31, 0.95)', borderRight: '1px solid var(--border)' }}>

      {/* ── Top gradient bar ───────────────────────────────────────────── */}
      <div style={{
        height: 3, flexShrink: 0,
        background: 'var(--gradient-brand)',
        boxShadow: '0 0 20px rgba(129,140,248,0.5)',
      }} />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 14px rgba(129,140,248,0.4)' }}>
            <MessageCircle size={15} color="white" />
          </div>
          <span className="font-bold text-base gradient-text">Talk‑a‑Tive</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setShowGroupModal(true)}
            className="p-2 rounded-xl transition-all" title="New group"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <Users size={17} />
          </button>
          <button onClick={async () => { await logout(); toast.success('See you later!'); }}
            className="p-2 rounded-xl transition-all" title="Logout"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <LogOut size={17} />
          </button>
        </div>
      </div>

      {/* ── Profile card ──────────────────────────────────────────────── */}
      <div className="mx-3 mb-3 rounded-2xl p-3 flex items-center gap-3 flex-shrink-0"
        style={{
          background: 'rgba(129,140,248,0.07)',
          border: '1px solid rgba(129,140,248,0.15)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}>
        <Avatar name={user?.username} src={user?.avatar} size={40} online={true} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.username}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--online)', display: 'inline-block', boxShadow: '0 0 6px var(--online)' }} />
            <span className="text-xs" style={{ color: 'var(--online)' }}>Active now</span>
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-lg font-medium"
          style={{ background: 'rgba(129,140,248,0.15)', color: 'var(--accent-light)' }}>
          You
        </div>
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="px-3 mb-2 flex-shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users to chat..."
            className="input-field w-full pl-9 pr-8 py-2.5 rounded-xl text-sm" />
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Search results ────────────────────────────────────────────── */}
      {search && (
        <div className="mx-3 mb-2 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: 'rgba(20,23,49,0.9)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
          {searching ? (
            <div className="flex items-center justify-center py-5">
              <Loader2 size={18} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : searchResults.length === 0 ? (
            <p className="text-center text-xs py-5" style={{ color: 'var(--text-muted)' }}>No users found</p>
          ) : searchResults.map((u) => (
            <button key={u._id} onClick={() => openDM(u._id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Avatar name={u.username} size={34} online={onlineUsers.includes(u._id)} />
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.username}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
              </div>
              <Plus size={14} className="ml-auto flex-shrink-0" style={{ color: 'var(--accent-light)' }} />
            </button>
          ))}
        </div>
      )}

      {/* ── Chat list ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <p className="px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}>Conversations</p>

        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3"
            style={{ animation: 'fade-up 0.4s ease both' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)' }}>
              <MessageCircle size={22} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-xs text-center px-4" style={{ color: 'var(--text-muted)' }}>
              Search for someone above to start a conversation
            </p>
          </div>
        ) : chats.map((chat) => {
          const active = selectedChat?._id === chat._id;
          const unread = unreadCounts?.[chat._id] || 0;
          return (
            <button key={chat._id} onClick={() => setSelectedChat(chat)}
              className="chat-item sidebar-item-enter w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left"
              style={{
                background: active
                  ? 'linear-gradient(135deg, rgba(129,140,248,0.18), rgba(34,211,238,0.08))'
                  : 'transparent',
                border: active ? '1px solid rgba(129,140,248,0.25)' : '1px solid transparent',
                boxShadow: active ? '0 4px 16px rgba(129,140,248,0.12)' : 'none',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(129,140,248,0.07)'; e.currentTarget.style.border = '1px solid rgba(129,140,248,0.12)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; } }}>
              <Avatar name={getChatName(chat)} src={getChatAvatar(chat)} size={42} online={!chat.isGroupChat && isOnline(chat)} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm truncate" style={{ color: 'var(--text-primary)', fontWeight: unread > 0 ? 700 : 500 }}>
                    {getChatName(chat)}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {chat.latestMessage && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatTime(chat.latestMessage.createdAt)}
                      </span>
                    )}
                    {unread > 0 && (
                      <span key={unread} className="badge-pop min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: 'var(--gradient-brand)', color: 'white', boxShadow: '0 0 8px rgba(129,140,248,0.5)' }}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs truncate mt-0.5"
                  style={{ color: unread > 0 ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: unread > 0 ? 500 : 400 }}>
                  {chat.latestMessage
                    ? `${chat.latestMessage.sender?.username === user.username ? 'You' : chat.latestMessage.sender?.username}: ${chat.latestMessage.content}`
                    : chat.isGroupChat ? `${chat.participants.length} members` : 'Start a conversation'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {showGroupModal && (
        <GroupModal
          onClose={() => setShowGroupModal(false)}
          onCreated={(chat) => { setChats([chat, ...chats]); setSelectedChat(chat); setShowGroupModal(false); }}
        />
      )}
    </div>
  );
}

function GroupModal({ onClose, onCreated }) {
  const { onlineUsers } = useSocket();
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!search.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      try { const { data } = await api.get(`/auth/search?search=${search}`); setResults(data); } catch { /**/ }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const toggle = (u) => setSelected((p) => p.find((x) => x._id === u._id) ? p.filter((x) => x._id !== u._id) : [...p, u]);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('Group name required'); return; }
    if (selected.length < 2) { toast.error('Add at least 2 members'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/chats/group', { name, participants: selected.map((u) => u._id) });
      onCreated(data); toast.success('Group created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-6 w-full max-w-md shadow-2xl"
        style={{ animation: 'fade-up 0.25s ease both' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold gradient-text">Create Group</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <X size={18} />
          </button>
        </div>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name..."
          className="input-field w-full px-4 py-2.5 rounded-xl text-sm mb-4" />

        <div className="relative mb-3">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members..."
            className="input-field w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selected.map((u) => (
              <span key={u._id} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(129,140,248,0.2)', color: 'var(--accent-light)', border: '1px solid rgba(129,140,248,0.25)' }}>
                {u.username}
                <button onClick={() => toggle(u)}><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-44 overflow-y-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
          {results.map((u) => {
            const sel = !!selected.find((p) => p._id === u._id);
            return (
              <button key={u._id} onClick={() => toggle(u)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                style={{ background: sel ? 'rgba(129,140,248,0.12)' : 'transparent', borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                <Avatar name={u.username} size={30} online={onlineUsers.includes(u._id)} />
                <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{u.username}</span>
                {sel && <span className="text-xs font-bold" style={{ color: 'var(--accent-light)' }}>✓</span>}
              </button>
            );
          })}
        </div>

        <button onClick={handleCreate} disabled={loading}
          className="btn-gradient w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={14} className="animate-spin" /> Creating...</> : <><Users size={14} /> Create Group</>}
        </button>
      </div>
    </div>
  );
}
