import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}>

      {/* Floating orbs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: 560, height: 560, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(129,140,248,0.18) 0%, transparent 70%)',
        animation: 'orb-drift 9s ease-in-out infinite', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.14) 0%, transparent 70%)',
        animation: 'orb-drift 12s ease-in-out infinite reverse', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: '20%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
        animation: 'orb-drift 7s ease-in-out infinite 2s', pointerEvents: 'none',
      }} />

      <div className="relative w-full max-w-md" style={{ animation: 'fade-up 0.5s ease both' }}>

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
            style={{ background: 'var(--gradient-brand)', boxShadow: '0 0 32px rgba(129,140,248,0.4)' }}>
            <MessageCircle size={30} color="white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">Talk‑a‑Tive</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field w-full pl-10 pr-10 py-3 rounded-xl text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <><Zap size={15} /> Sign In</>}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            No account?{' '}
            <Link to="/signup" className="font-semibold hover:underline"
              style={{ color: 'var(--accent-light)' }}>Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
}
