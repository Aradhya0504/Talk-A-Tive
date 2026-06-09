import { useState, useEffect, useRef } from 'react';
import { Send, Users, ArrowDown, ArrowLeft, Copy, Check, Sparkles, WifiOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDateLabel = (d) => {
  const date = new Date(d), now = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 86_400_000);
  const msgDay    = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgDay.getTime() === today.getTime())     return 'Today';
  if (msgDay.getTime() === yesterday.getTime()) return 'Yesterday';
  if (now - date < 7 * 86_400_000) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const groupByDate = (msgs) => {
  const items = []; let last = null;
  for (const msg of msgs) {
    const label = formatDateLabel(msg.createdAt);
    if (label !== last) { items.push({ type: 'date', label }); last = label; }
    items.push({ type: 'msg', msg });
  }
  return items;
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const SKELETON_WIDTHS = ['52%', '38%', '61%', '44%', '55%'];

function SkeletonRow({ mine, index = 0 }) {
  const w = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];
  return (
    <div className={`flex items-end gap-2 pb-3 ${mine ? 'flex-row-reverse' : ''}`}>
      {!mine && <div className="skeleton flex-shrink-0" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
      <div className={`flex flex-col gap-1.5 ${mine ? 'items-end' : ''}`} style={{ width: w }}>
        <div className="skeleton" style={{ height: 40, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 10, width: 44, borderRadius: 8 }} />
      </div>
    </div>
  );
}

// ── Typing dots ───────────────────────────────────────────────────────────────

function TypingBubble() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 rounded-2xl" style={{
      background: 'rgba(129,140,248,0.1)',
      border: '1px solid rgba(129,140,248,0.2)',
      borderBottomLeftRadius: 4,
      width: 'fit-content',
      backdropFilter: 'blur(8px)',
    }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setDone(true); setTimeout(() => setDone(false), 1500);
  };
  return (
    <button onClick={copy} className="action-btn p-1.5 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
      {done ? <Check size={11} style={{ color: 'var(--online)' }} /> : <Copy size={11} />}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyChat({ name }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4"
      style={{ animation: 'fade-up 0.5s ease both' }}>
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(34,211,238,0.1))',
            border: '1px solid rgba(129,140,248,0.2)',
            boxShadow: '0 8px 32px rgba(129,140,248,0.15)',
          }}>
          <Sparkles size={32} style={{ color: 'var(--accent-light)' }} />
        </div>
        {/* Small glow orb behind */}
        <div className="absolute inset-0 rounded-3xl"
          style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.2), transparent 70%)', filter: 'blur(12px)', zIndex: -1 }} />
      </div>
      <div className="text-center">
        <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Say hello to {name}!</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Start the conversation ✨</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ChatBox({ chat, onLatestMessage, onBack }) {
  const { user }            = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();
  const [showMembers, setShowMembers] = useState(false);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const containerRef   = useRef(null);
  const endRef         = useRef(null);
  const typingTimer    = useRef(null);
  const currentChatRef = useRef(chat._id);
  const isAtBottomRef  = useRef(true);

  useEffect(() => {
    currentChatRef.current = chat._id;
    setMessages([]); setTypingUsers({}); setLoading(true); isAtBottomRef.current = true;
    api.get(`/messages/${chat._id}`)
      .then(({ data }) => setMessages(data))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false));
  }, [chat._id]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', chat._id);
    return () => socket.emit('chat:leave', chat._id);
  }, [socket, chat._id]);

  useEffect(() => {
    if (!socket) return;
    const onReceive = (msg) => {
      if (msg.chat._id === currentChatRef.current || msg.chat === currentChatRef.current) {
        setMessages((p) => [...p, msg]); onLatestMessage(msg);
      }
    };
    const onStart = ({ chatId, username }) => {
      if (chatId === currentChatRef.current && username !== user.username)
        setTypingUsers((p) => ({ ...p, [username]: true }));
    };
    const onStop = ({ chatId, username }) => {
      if (chatId === currentChatRef.current)
        setTypingUsers((p) => { const n = { ...p }; delete n[username]; return n; });
    };
    socket.on('message:receive', onReceive);
    socket.on('typing:start', onStart);
    socket.on('typing:stop',  onStop);
    return () => { socket.off('message:receive', onReceive); socket.off('typing:start', onStart); socket.off('typing:stop', onStop); };
  }, [socket, onLatestMessage, user.username]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      endRef.current?.scrollIntoView({ behavior: messages.length <= 1 ? 'instant' : 'smooth' });
      setShowScrollBtn(false);
    } else { setShowScrollBtn(true); }
  }, [messages]);

  const handleScroll = () => {
    const el = containerRef.current; if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    isAtBottomRef.current = atBottom; setShowScrollBtn(!atBottom);
  };

  const scrollToBottom = () => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); isAtBottomRef.current = true; setShowScrollBtn(false); };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing:start', { chatId: chat._id, username: user.username });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket.emit('typing:stop', { chatId: chat._id, username: user.username }), 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim(); if (!text) return;
    setSending(true); setInput('');
    clearTimeout(typingTimer.current);
    socket?.emit('typing:stop', { chatId: chat._id, username: user.username });
    try {
      const { data } = await api.post('/messages', { content: text, chatId: chat._id });
      setMessages((p) => [...p, data]); onLatestMessage(data); socket?.emit('message:send', data);
      isAtBottomRef.current = true;
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch { toast.error('Failed to send'); setInput(text); }
    finally { setSending(false); }
  };

  const chatName = chat.isGroupChat
    ? chat.name
    : chat.participants.find((p) => p._id !== user._id)?.username || 'Unknown';

  const otherUser = chat.isGroupChat ? null : chat.participants.find((p) => p._id !== user._id);
  const isOtherOnline = otherUser ? onlineUsers.includes(otherUser._id) : false;

  const typingNames = Object.keys(typingUsers);
  const items = groupByDate(messages);

  return (
    <div className="flex flex-col w-full h-full relative" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Reconnecting banner ─────────────────────────────────────── */}
      {socket && !isConnected && (
        <div className="flex items-center justify-center gap-2 py-2 flex-shrink-0 text-xs font-medium"
          style={{ background: 'rgba(248,113,113,0.12)', borderBottom: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)', animation: 'fade-up 0.3s ease both' }}>
          <WifiOff size={13} />
          Reconnecting…
        </div>
      )}

      {/* ── Header (glass) ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
        style={{
          background: 'rgba(16, 18, 42, 0.85)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(16px)',
        }}>
        <button onClick={onBack} className="md:hidden p-1.5 rounded-xl mr-1 flex-shrink-0"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
          <ArrowLeft size={20} />
        </button>

        <Avatar name={chatName} size={40} online={!chat.isGroupChat && isOtherOnline} />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{chatName}</p>
          <p className="text-xs transition-all duration-300"
            style={{ color: typingNames.length ? 'var(--accent-light)' : isOtherOnline ? 'var(--online)' : 'var(--text-muted)' }}>
            {typingNames.length
              ? `${typingNames.join(', ')} ${typingNames.length === 1 ? 'is' : 'are'} typing`
              : chat.isGroupChat ? `${chat.participants.length} members` : isOtherOnline ? '● Online' : 'Offline'}
          </p>
        </div>

        {chat.isGroupChat && (
          <button onClick={() => setShowMembers(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all"
            title="View members"
            style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', color: 'var(--accent-light)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.2)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(129,140,248,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(129,140,248,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
            <Users size={13} /><span className="text-xs font-medium">{chat.participants.length} members</span>
          </button>
        )}
      </div>

      {/* ── Messages ─────────────────────────────────────────────────── */}
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="space-y-3">
            {[false, true, false, false, true].map((m, i) => <SkeletonRow key={i} mine={m} index={i} />)}
          </div>
        ) : messages.length === 0 ? (
          <EmptyChat name={chatName} />
        ) : (
          <div className="space-y-0.5">
            {items.map((item, idx) => {
              if (item.type === 'date') return (
                <div key={`d-${idx}`} className="flex items-center justify-center my-6">
                  <span className="px-4 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(129,140,248,0.1)',
                      color: 'var(--accent-light)',
                      border: '1px solid rgba(129,140,248,0.2)',
                      backdropFilter: 'blur(8px)',
                    }}>
                    {item.label}
                  </span>
                </div>
              );

              const { msg } = item;
              const isMine = msg.sender._id === user._id || msg.sender === user._id;
              const senderName = msg.sender?.username || '';

              return (
                <div key={msg._id}
                  className={`msg-row flex items-end gap-2 pb-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine
                    ? <Avatar name={senderName} src={msg.sender?.avatar} size={28} />
                    : <div style={{ width: 28, flexShrink: 0 }} />}

                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
                    {chat.isGroupChat && !isMine && (
                      <span className="text-xs mb-1 ml-1 font-semibold" style={{ color: 'var(--accent-light)' }}>
                        {senderName}
                      </span>
                    )}
                    <div className={`flex items-center gap-1.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <div className={`msg-bubble px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isMine ? 'msg-mine' : 'msg-theirs'}`}
                        style={isMine ? {
                          background: 'var(--gradient-msg)',
                          color: 'white',
                          borderBottomRightRadius: 4,
                          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                        } : {
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'var(--text-primary)',
                          borderBottomLeftRadius: 4,
                          backdropFilter: 'blur(8px)',
                        }}>
                        {msg.content}
                      </div>
                      <CopyBtn text={msg.content} />
                    </div>
                    <span className="text-xs mt-1 mx-1" style={{ color: 'var(--text-muted)' }}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}

            {typingNames.length > 0 && (
              <div className="flex items-end gap-2 pb-1" style={{ animation: 'msg-in-left 0.2s ease both' }}>
                <Avatar name={typingNames[0]} size={28} />
                <TypingBubble />
              </div>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Group members panel ──────────────────────────────────────── */}
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowMembers(false)}>
          <div className="glass rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            style={{ animation: 'fade-up 0.25s ease both' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold gradient-text">{chat.name}</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{chat.participants.length} members</p>
              </div>
              <button onClick={() => setShowMembers(false)} className="p-1.5 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {chat.participants.map((p) => {
                const online = onlineUsers.includes(p._id);
                const isMe = p._id === user._id;
                return (
                  <div key={p._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                    <Avatar name={p.username} src={p.avatar} size={36} online={online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.username}{isMe && <span className="ml-2 text-xs font-normal" style={{ color: 'var(--accent-light)' }}>you</span>}
                      </p>
                      <p className="text-xs" style={{ color: online ? 'var(--online)' : 'var(--text-muted)' }}>
                        {online ? '● Online' : 'Offline'}
                      </p>
                    </div>
                    {chat.admin === p._id && (
                      <span className="text-xs px-2 py-0.5 rounded-lg font-medium flex-shrink-0"
                        style={{ background: 'rgba(129,140,248,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(129,140,248,0.25)' }}>
                        admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showScrollBtn && (
        <button onClick={scrollToBottom}
          className="send-btn absolute flex items-center justify-center w-9 h-9 rounded-full"
          style={{
            bottom: 76, right: 20, zIndex: 10,
            background: 'var(--gradient-brand)',
            color: 'white',
            boxShadow: '0 4px 16px rgba(129,140,248,0.4)',
          }}>
          <ArrowDown size={16} />
        </button>
      )}

      {/* ── Input bar (glass) ────────────────────────────────────────── */}
      <div className="flex-shrink-0"
        style={{ background: 'rgba(16, 18, 42, 0.85)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <form onSubmit={sendMessage} className="flex items-center gap-3 px-4 pt-3.5 pb-2">
          <input
            value={input} onChange={handleTyping}
            placeholder={`Message ${chatName}...`}
            className="input-field flex-1 px-4 py-2.5 rounded-2xl text-sm" />
          <button type="submit" disabled={sending || !input.trim()}
            className="send-btn w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: input.trim() ? 'var(--gradient-btn)' : 'rgba(255,255,255,0.05)',
              color: input.trim() ? 'white' : 'var(--text-muted)',
              border: input.trim() ? 'none' : '1px solid var(--border)',
            }}>
            {sending
              ? <span className="typing-dot" style={{ background: 'white', width: 8, height: 8 }} />
              : <Send size={16} />}
          </button>
        </form>
        <p className="text-center pb-2 text-xs" style={{ color: 'var(--text-muted)', opacity: input.trim() ? 1 : 0, transition: 'opacity 0.2s ease' }}>
          Press <kbd style={{ padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', fontSize: 10 }}>Enter</kbd> to send
        </p>
      </div>
    </div>
  );
}
