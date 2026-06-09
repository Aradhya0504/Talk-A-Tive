import { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Sidebar from '../components/chat/Sidebar';
import ChatBox from '../components/chat/ChatBox';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await api.get('/chats');
        setChats(data);
      } catch {
        toast.error('Failed to load chats');
      }
    };
    fetchChats();
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setUnreadCounts((prev) => ({ ...prev, [chat._id]: 0 }));
  };

  const handleLatestMessage = useCallback((msg) => {
    const chatId = msg.chat._id || msg.chat;
    setChats((prev) =>
      prev.map((c) =>
        c._id === chatId
          ? { ...c, latestMessage: msg, updatedAt: new Date().toISOString() }
          : c
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    );
  }, []);

  const handleIncomingMessage = useCallback((msg) => {
    const chatId = msg.chat._id || msg.chat;
    handleLatestMessage(msg);
    setUnreadCounts((prev) => {
      const isActive = selectedChat?._id === chatId;
      if (isActive) return prev;
      return { ...prev, [chatId]: (prev[chatId] || 0) + 1 };
    });
  }, [handleLatestMessage, selectedChat]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar: always visible on md+, hidden on mobile when chat open */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col h-full`}
        style={{ width: 320, minWidth: 320, flexShrink: 0 }}>
        <Sidebar
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          setSelectedChat={handleSelectChat}
          unreadCounts={unreadCounts}
        />
      </div>

      {/* ChatBox: full width on mobile, flex-1 on desktop */}
      {selectedChat ? (
        <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
          <ChatBox
            key={selectedChat._id}
            chat={selectedChat}
            onLatestMessage={handleIncomingMessage}
            onBack={() => setSelectedChat(null)}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-5 relative overflow-hidden"
          style={{ background: 'var(--bg-primary)' }}>
          {/* background orbs */}
          <div style={{ position:'absolute', top:'20%', left:'30%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(129,140,248,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'15%', right:'25%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="relative" style={{ animation:'fade-up 0.5s ease both' }}>
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(34,211,238,0.1))', border:'1px solid rgba(129,140,248,0.2)', boxShadow:'0 16px 48px rgba(129,140,248,0.15)' }}>
              <MessageCircle size={40} style={{ color:'var(--accent-light)' }} />
            </div>
          </div>
          <div className="text-center" style={{ animation:'fade-up 0.5s 0.1s ease both' }}>
            <h2 className="text-2xl font-bold gradient-text mb-2">Welcome to Talk‑a‑Tive</h2>
            <p className="text-sm" style={{ color:'var(--text-secondary)' }}>
              Pick a conversation from the left, or search for someone new
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
