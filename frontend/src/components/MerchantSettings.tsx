import { type FormEvent, useState } from 'react';
import { ChevronDown, KeyRound, Save, Settings, UserCog } from 'lucide-react';
import { api } from '@/lib/api';
import { useMerchantStore } from '@/store/merchantStore';
import type { Merchant, MerchantProfileInput } from '@/types';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-200 dark:border-slate-600 dark:bg-slate-700/60';

function toProfileForm(m: Merchant): MerchantProfileInput {
  return {
    ownerName: m.ownerName,
    kecamatan: m.kecamatan,
    kota: m.kota ?? '',
    kabupaten: m.kabupaten ?? '',
    kodePos: m.kodePos ?? '',
    phone: m.phone ?? '',
    landmark: m.landmark ?? '',
  };
}

/** Collapsible "Pengaturan Toko" panel: edit profile/address and change password. */
export default function MerchantSettings() {
  const merchant = useMerchantStore((s) => s.merchant);
  const token = useMerchantStore((s) => s.token) ?? '';
  const setMerchant = useMerchantStore((s) => s.setMerchant);
  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState<MerchantProfileInput>(() =>
    merchant ? toProfileForm(merchant) : {},
  );
  const [pMsg, setPMsg] = useState<string | null>(null);
  const [pBusy, setPBusy] = useState(false);

  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [sMsg, setSMsg] = useState<string | null>(null);
  const [sErr, setSErr] = useState(false);
  const [sBusy, setSBusy] = useState(false);

  if (!merchant) return null;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setPMsg(null);
    setPBusy(true);
    try {
      const updated = await api.updateMyProfile(token, profile);
      setMerchant(updated);
      setPMsg('Profil & alamat toko tersimpan. Lokasi peta diperbarui otomatis.');
    } catch (e2) {
      setPMsg(e2 instanceof Error ? e2.message : 'Gagal menyimpan profil.');
    } finally {
      setPBusy(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSMsg(null);
    setSBusy(true);
    try {
      await api.changeMyPassword(token, curPass, newPass);
      setSErr(false);
      setSMsg('Kata sandi berhasil diperbarui.');
      setCurPass('');
      setNewPass('');
    } catch (e2) {
      setSErr(true);
      setSMsg(e2 instanceof Error ? e2.message : 'Gagal mengubah kata sandi.');
    } finally {
      setSBusy(false);
    }
  };

  return (
    <div className="mb-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold"
      >
        <span className="flex items-center gap-2">
          <Settings size={16} className="text-brand" /> Pengaturan Toko
        </span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 p-4 dark:border-slate-700 md:grid-cols-2">
          {/* Profile / address */}
          <form onSubmit={saveProfile} className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <UserCog size={13} /> Profil & Alamat
            </p>
            <label className="block text-xs font-semibold">
              Nama Pemilik
              <input
                className={inputCls}
                value={profile.ownerName ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, ownerName: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold">
              Kecamatan
              <input
                className={inputCls}
                value={profile.kecamatan ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, kecamatan: e.target.value }))}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs font-semibold">
                Kota
                <input
                  className={inputCls}
                  value={profile.kota ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, kota: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold">
                Kode Pos
                <input
                  className={inputCls}
                  value={profile.kodePos ?? ''}
                  onChange={(e) => setProfile((p) => ({ ...p, kodePos: e.target.value }))}
                />
              </label>
            </div>
            <label className="block text-xs font-semibold">
              Nomor HP
              <input
                className={inputCls}
                value={profile.phone ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-semibold">
              Patokan
              <input
                className={inputCls}
                value={profile.landmark ?? ''}
                onChange={(e) => setProfile((p) => ({ ...p, landmark: e.target.value }))}
              />
            </label>
            {pMsg && (
              <p className="rounded bg-slate-50 px-2 py-1.5 text-[11px] text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                {pMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={pBusy}
              className="press flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              <Save size={13} /> {pBusy ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>

          {/* Change password */}
          <form onSubmit={changePassword} className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <KeyRound size={13} /> Ubah Kata Sandi
            </p>
            <label className="block text-xs font-semibold">
              Kata Sandi Saat Ini
              <input
                required
                type="password"
                className={inputCls}
                value={curPass}
                onChange={(e) => setCurPass(e.target.value)}
              />
            </label>
            <label className="block text-xs font-semibold">
              Kata Sandi Baru (min 6)
              <input
                required
                minLength={6}
                type="password"
                className={inputCls}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </label>
            {sMsg && (
              <p
                className={`rounded px-2 py-1.5 text-[11px] font-semibold ${
                  sErr
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}
              >
                {sMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={sBusy}
              className="press flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white hover:bg-slate-900 disabled:opacity-50 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              <KeyRound size={13} /> {sBusy ? 'Memperbarui...' : 'Ubah Kata Sandi'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
