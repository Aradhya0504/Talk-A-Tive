import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, User, Mail, Lock, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const iconStyle = { color: 'var(--text-muted)', pointerEvents: 'none' };
const labelClass = 'block text-xs font-semibold uppercase tracking-wider mb-2';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        username: form.username, email: form.email, password: form.password,
      });
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: 'var(--bg-deep)' }}>

      {/* Orbs */}
      <div style={{ position:'absolute', top:'-10%', right:'-15%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(244,114,182,0.15) 0%, transparent 70%)', animation:'orb-drift 10s ease-in-out infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(129,140,248,0.16) 0%, transparent 70%)', animation:'orb-drift 8s ease-in-out infinite reverse', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', left:'30%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', animation:'orb-drift 14s ease-in-out infinite 1s', pointerEvents:'none' }} />

      <div className="relative w-full max-w-md" style={{ animation:'fade-up 0.5s ease both' }}>

        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background:'var(--gradient-brand)', boxShadow:'0 0 32px rgba(129,140,248,0.4)' }}>
            <MessageCircle size={30} color="white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text tracking-tight">Talk‑a‑Tive</h1>
          <p className="mt-2 text-sm" style={{ color:'var(--text-secondary)' }}>Create your account</p>
        </div>

        <div className="glass rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className={labelClass} style={{ color:'var(--text-muted)' }}>Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={iconStyle} />
                <input type="text" required placeholder="cooluser123"
                  value={form.username} onChange={set('username')}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass} style={{ color:'var(--text-muted)' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={iconStyle} />
                <input type="email" required placeholder="you@example.com"
                  value={form.email} onChange={set('email')}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass} style={{ color:'var(--text-muted)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={iconStyle} />
                <input type={showPw ? 'text' : 'password'} required placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')}
                  className="input-field w-full pl-10 pr-10 py-3 rounded-xl text-sm" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color:'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className={labelClass} style={{ color:'var(--text-muted)' }}>Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={iconStyle} />
                <input type={showPw ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.confirm} onChange={set('confirm')}
                  className="input-field w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? 'var(--danger)' : undefined }} />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs mt-1.5 ml-1" style={{ color:'var(--danger)' }}>Passwords don't match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="btn-gradient w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                : <><Sparkles size={15} /> Create Account</>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
            <span className="text-xs" style={{ color:'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background:'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color:'var(--text-secondary)' }}>
            Have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline"
              style={{ color:'var(--accent-light)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
