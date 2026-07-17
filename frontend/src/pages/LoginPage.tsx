import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { useMerchantStore } from '@/store/merchantStore';
import { waConfigured, waReportUrl } from '@/lib/wa';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60';

export default function LoginPage() {
  const navigate = useNavigate();
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Forgot-password (WA report) fields.
  const [showForgot, setShowForgot] = useState(false);
  const [fShop, setFShop] = useState('');
  const [fOwner, setFOwner] = useState('');
  const [fArea, setFArea] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const merchant = await api.loginMerchant(email, password);
      setMerchant(merchant);
      navigate('/');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal masuk.');
    } finally {
      setBusy(false);
    }
  };

  const forgotUrl = waReportUrl('LUPA SANDI', {
    'Nama Toko': fShop,
    'Nama Pemilik': fOwner,
    Wilayah: fArea,
  });

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-slate-100 dark:bg-slate-900">
      <Navbar />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-brand dark:bg-orange-900/30">
              <LogIn size={20} />
            </span>
            <h2 className="text-lg font-bold">Masuk Akun Toko</h2>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              required
              type="email"
              placeholder="Email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              type="password"
              placeholder="Kata Sandi"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {err && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {err}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="press w-full rounded-lg bg-brand py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {busy ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <button
            onClick={() => setShowForgot((v) => !v)}
            className="mt-3 text-xs font-semibold text-slate-500 hover:text-brand dark:text-slate-400"
          >
            Lupa sandi?
          </button>

          {showForgot && (
            <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kirim laporan ke admin via WhatsApp. Isi data agar 1 tokomu ketemu pasti.
              </p>
              <input placeholder="Nama Toko" className={inputCls} value={fShop} onChange={(e) => setFShop(e.target.value)} />
              <input placeholder="Nama Pemilik" className={inputCls} value={fOwner} onChange={(e) => setFOwner(e.target.value)} />
              <input placeholder="Wilayah (kecamatan/kota)" className={inputCls} value={fArea} onChange={(e) => setFArea(e.target.value)} />
              {waConfigured && forgotUrl ? (
                <a
                  href={forgotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="press flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-sm font-bold text-white hover:bg-emerald-600"
                >
                  <MessageCircle size={15} /> Lapor via WhatsApp
                </a>
              ) : (
                <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Nomor WA belum dikonfigurasi (set VITE_WA_REPORT di .env).
                </p>
              )}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Belum punya akun?{' '}
            <Link to="/daftar" className="font-bold text-brand hover:underline">
              Daftar toko
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
