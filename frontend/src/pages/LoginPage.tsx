import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Navbar from '@/components/Navbar';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { api } from '@/lib/api';
import { useMerchantStore } from '@/store/merchantStore';
import { waConfigured, waReportUrl } from '@/lib/wa';
import { firebaseEnabled, signInWithGoogle } from '@/lib/firebase';

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
  const [fEmail, setFEmail] = useState('');
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);

  const doEmailReset = async () => {
    setResetMsg(null);
    setResetBusy(true);
    try {
      const r = await api.forgotPassword(fEmail);
      setResetMsg(
        r.devResetUrl ? `SMTP belum diset (mode dev). Link reset: ${r.devResetUrl}` : r.message,
      );
    } catch (e2) {
      setResetMsg(e2 instanceof Error ? e2.message : 'Gagal mengirim.');
    } finally {
      setResetBusy(false);
    }
  };

  const [gBusy, setGBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const merchant = await api.loginMerchant(email, password);
      setMerchant(merchant);
      navigate('/toko');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal masuk.');
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr(null);
    setGBusy(true);
    try {
      const acc = await signInWithGoogle();
      if (!acc?.email) throw new Error('Gagal mengambil akun Google.');
      const merchant = await api.googleLogin(acc.email);
      setMerchant(merchant);
      navigate('/toko');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Gagal masuk dengan Google.');
    } finally {
      setGBusy(false);
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

          {firebaseEnabled && (
            <>
              <div className="my-3 flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                atau
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              <button
                type="button"
                onClick={google}
                disabled={gBusy}
                className="press flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              >
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22 22-9.8 22-22c0-1.3-.1-2.3-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 15.5 2 8.1 6.9 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 46c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 36.7 26.9 38 24 38c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C8 41 15.4 46 24 46z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C41.4 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
                </svg>
                {gBusy ? 'Memproses...' : 'Masuk dengan Google'}
              </button>
            </>
          )}

          <button
            onClick={() => setShowForgot((v) => !v)}
            className="mt-3 text-xs font-semibold text-slate-500 hover:text-brand dark:text-slate-400"
          >
            Lupa sandi?
          </button>

          {showForgot && (
            <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                <p className="mb-1 text-[11px] font-bold">Reset via Email</p>
                <input
                  type="email"
                  placeholder="Email akun"
                  className={inputCls}
                  value={fEmail}
                  onChange={(e) => setFEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={doEmailReset}
                  disabled={resetBusy}
                  className="press mt-1.5 w-full rounded-lg bg-brand py-1.5 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {resetBusy ? 'Mengirim...' : 'Kirim link reset ke email'}
                </button>
                {resetMsg && (
                  <p className="mt-1 break-all text-[10px] text-slate-600 dark:text-slate-300">
                    {resetMsg}
                  </p>
                )}
              </div>
              <p className="text-center text-[10px] font-semibold text-slate-400">
                atau lapor ke admin via WhatsApp:
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Isi data agar 1 tokomu ketemu pasti.
              </p>
              <input placeholder="Nama Toko" className={inputCls} value={fShop} onChange={(e) => setFShop(e.target.value)} />
              <input placeholder="Nama Pemilik" className={inputCls} value={fOwner} onChange={(e) => setFOwner(e.target.value)} />
              <input placeholder="Wilayah (kecamatan/kota)" className={inputCls} value={fArea} onChange={(e) => setFArea(e.target.value)} />
              {waConfigured && forgotUrl ? (
                <a
                  href={forgotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="press flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2 text-sm font-bold text-white hover:brightness-95"
                >
                  <WhatsAppIcon size={16} /> Lapor via WhatsApp
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
