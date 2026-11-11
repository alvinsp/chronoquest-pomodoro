import React, { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, RefreshCw, CheckCircle, ShieldCheck, Mail, Sparkles, AlertCircle, Smartphone, Download, Key } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useStatsStore } from '../../store/useStatsStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { formatDatePretty } from '../../utils/formatters';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              width?: number;
              logo_alignment?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    googleClientId,
    lastSyncedAt,
    isAutoSyncEnabled,
    isGoogleVerified,
    loginWithGoogleCredential,
    loginWithGoogleProfile,
    logout,
    saveAccountData,
    loadAccountData,
    setGoogleClientId,
    toggleAutoSync,
  } = useAuthStore();

  const { exportDataJson } = useStatsStore();

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [clientIdInput, setClientIdInput] = useState(googleClientId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [gisLoaded, setGisLoaded] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const googleLinkBtnRef = useRef<HTMLDivElement>(null);

  // Initialize official Google Identity Services button with mobile readiness & retry
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        setGisLoaded(true);

        const onCredentialResponse = (response: { credential: string }) => {
          const success = loginWithGoogleCredential(response.credential);
          if (success) {
            setSyncSuccessMsg('🎉 Berhasil! Seluruh data kamu telah ditautkan ke Akun Google resmi.');
          }
        };

        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: onCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnWidth = Math.min(280, window.innerWidth - 60);

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'filled_black',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: btnWidth,
              logo_alignment: 'left',
            });
          }

          if (googleLinkBtnRef.current) {
            googleLinkBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleLinkBtnRef.current, {
              theme: 'filled_black',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: btnWidth,
              logo_alignment: 'left',
            });
          }
        } catch {
          // GIS rendering fallback
        }
      }

      if (attempts >= 25) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen, googleClientId, loginWithGoogleCredential, user, isGoogleVerified]);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;

    loginWithGoogleProfile({
      email: inputEmail.trim(),
      name: inputName.trim() || inputEmail.split('@')[0],
      picture: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(inputEmail.trim())}`,
    });

    setSyncSuccessMsg(`Data saat ini berhasil diikat ke profil: ${inputEmail}`);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    saveAccountData();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccessMsg('Data lokal saat ini berhasil disimpan ke profil Akun Google!');
    }, 400);
  };

  const handleManualRestore = () => {
    setIsSyncing(true);
    const success = loadAccountData();
    setTimeout(() => {
      setIsSyncing(false);
      if (success) {
        setSyncSuccessMsg('Data akun berhasil dipulihkan!');
        window.location.reload();
      } else {
        setSyncSuccessMsg('Belum ada data cadangan tersimpan untuk akun ini.');
      }
    }, 400);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-pomodoro-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSyncSuccessMsg('File cadangan berhasil di-download.');
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🔐 Akun Google & Cloud Sync" maxWidth="md">
      <div className="space-y-4 text-xs font-silkscreen">
        {user ? (
          /* User is Logged In */
          <div className="space-y-4">
            {/* Account Card */}
            <div className="p-4 bg-[#120f20] border-2 border-[#00ff66] flex items-center gap-3.5 shadow-[2px_2px_0px_#000]">
              <div className="w-12 h-12 border-2 border-black bg-[#231d37] overflow-hidden shrink-0 flex items-center justify-center">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <Mail size={24} className="text-[#00f0ff]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-pixel text-xs text-[#00ff66] truncate">{user.name}</h4>
                  <span
                    className={`text-[9px] font-pixel px-1.5 py-0.5 border ${
                      isGoogleVerified
                        ? 'bg-[#052e16] text-[#00ff66] border-[#00ff66]'
                        : 'bg-[#332205] text-[#ffd700] border-[#ffd700]'
                    }`}
                  >
                    {isGoogleVerified ? 'GOOGLE VERIFIED ✓' : 'EMAIL PROFILE'}
                  </span>
                </div>
                <p className="text-xs text-[#a097bd] truncate mt-0.5">{user.email}</p>
                <p className="text-[10px] text-[#6d648b] mt-1">
                  Sinkronisasi Terakhir:{' '}
                  {lastSyncedAt ? formatDatePretty(lastSyncedAt.split('T')[0]) : 'Baru saja'}
                </p>
              </div>
            </div>

            {/* If user logged in via email only, provide one-click Upgrade to Google GIS button */}
            {!isGoogleVerified && (
              <div className="p-3.5 bg-[#171329] border-2 border-[#ffd700] space-y-2">
                <div className="flex items-start gap-2">
                  <Key size={16} className="text-[#ffd700] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#ffd700] text-xs">
                      Tautkan ke Akun Google Resmi (Client ID GIS)
                    </h5>
                    <p className="text-[11px] text-[#d3cbe7] mt-0.5 leading-relaxed">
                      Kamu sebelumnya masuk via email. Klik tombol di bawah untuk menautkannya ke Akun Google resmi. <strong>Data level, EXP, koin, dan targetmu yang sekarang tidak akan hilang!</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <div ref={googleLinkBtnRef} className="min-h-[44px]" />
                  {!gisLoaded && (
                    <span className="text-[10px] text-[#8e85aa] animate-pulse mt-1">
                      Menyiapkan tombol Google...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Sync Alert Message */}
            {syncSuccessMsg && (
              <div className="p-2.5 bg-[#052e16] border border-[#00ff66] text-[#00ff66] flex items-center gap-2">
                <CheckCircle size={15} />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Sync Controls */}
            <div className="p-3 bg-[#161226] border-2 border-[#2b2447] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#f0edf6]">Simpan Otomatis (Auto-Sync)</span>
                  <p className="text-[10px] text-[#786f94]">
                    Menyimpan otomatis setiap kali sesi fokus pomodoro selesai.
                  </p>
                </div>
                <button
                  onClick={toggleAutoSync}
                  className={`px-3 py-1 font-pixel text-xs border cursor-pointer ${
                    isAutoSyncEnabled ? 'bg-[#00ff66] text-black border-black' : 'bg-[#2b2445] text-[#8e85aa] border-black'
                  }`}
                >
                  {isAutoSyncEnabled ? 'AKTIF' : 'OFF'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#261f3e] grid grid-cols-2 gap-2">
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>Kunci & Simpan Data Saat Ini</span>
                </PixelButton>

                <PixelButton
                  variant="retro-dark"
                  size="sm"
                  onClick={handleManualRestore}
                  disabled={isSyncing}
                >
                  <span>Muat Ulang Data Akun</span>
                </PixelButton>
              </div>
            </div>

            {/* Safety Backup Download Button */}
            <div className="p-2.5 bg-[#0d0c15] border border-[#2b2447] flex items-center justify-between">
              <span className="text-[10px] text-[#9f97ba]">
                Ingin punya salinan file cadangan mandiri?
              </span>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="text-[10px] font-silkscreen text-[#00f0ff] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={12} /> Download Backup JSON
              </button>
            </div>

            {/* Logout button */}
            <div className="pt-2 flex justify-between items-center border-t border-[#2b2545]">
              <span className="text-[10px] text-[#71688d]">
                Data aman tersimpan untuk: {user.email}
              </span>
              <PixelButton variant="danger" size="sm" onClick={logout}>
                <LogOut size={13} />
                <span>Keluar Akun</span>
              </PixelButton>
            </div>
          </div>
        ) : (
          /* User is NOT Logged In */
          <div className="space-y-4">
            <div className="p-3 bg-[#130f21] border-2 border-[#ffd700] flex items-start gap-2.5">
              <Sparkles size={18} className="text-[#ffd700] shrink-0 mt-0.5" />
              <p className="text-xs text-[#d3cbe7] leading-relaxed">
                <strong>Data kamu yang ada sekarang TIDAK AKAN HILANG.</strong> Saat kamu login menggunakan tombol Google, seluruh progres level, statistik, target harian, dan catatanmu saat ini akan otomatis tersimpan dan terikat ke Akun Google-mu!
              </p>
            </div>

            {/* Official Google Sign-In Button (GIS) */}
            <div className="p-4 bg-[#120f20] border-2 border-[#00f0ff] flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#00f0ff] font-bold uppercase">
                <Smartphone size={14} />
                <span>Login Resmi Google (Client ID Aktif)</span>
              </div>

              <div ref={googleBtnRef} className="min-h-[44px] flex items-center justify-center w-full" />

              {!gisLoaded && (
                <div className="text-[10px] text-[#8e85aa] animate-pulse">
                  Memuat tombol resmi Google...
                </div>
              )}

              <p className="text-[10px] text-[#786f94] text-center">
                Mendukung login di laptop/PC maupun HP mobile.
              </p>
            </div>

            {/* Fast Google Login by Email Form */}
            <form onSubmit={handleCustomLogin} className="p-4 bg-[#120f20] border-2 border-[#2b2545] space-y-3">
              <h4 className="font-pixel text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                <LogIn size={13} />
                Atau Masuk Cepat dengan Email & Username
              </h4>

              <div>
                <label className="block text-xs text-[#9f97ba] mb-1">
                  Email Akun Google Kamu:
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: nama.kamu@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-xs text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9f97ba] mb-1">
                  Nama Panggilan / Username:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Alvin"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-xs text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff]"
                />
              </div>

              <PixelButton type="submit" variant="primary" size="md" fullWidth>
                <ShieldCheck size={15} />
                <span>Simpan & Masuk dengan Akun Ini</span>
              </PixelButton>
            </form>

            {/* Google OAuth Client ID Configuration Info */}
            <div className="p-3 bg-[#0d0c15] border border-[#261f3a] space-y-2 text-[11px]">
              <div className="flex items-center gap-1 text-[#ffd700] font-bold">
                <AlertCircle size={13} />
                <span>Google Client ID GIS Terpasang:</span>
              </div>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="xxxx.apps.googleusercontent.com"
                className="w-full bg-[#151224] border border-[#3b335c] p-1.5 text-[10px] text-[#00f0ff] outline-none font-mono"
              />
              <div className="flex justify-between items-center text-[10px] text-[#71688d]">
                <span>Siap untuk Desktop & HP Mobile</span>
                <button
                  type="button"
                  onClick={() => {
                    setGoogleClientId(clientIdInput.trim());
                    setSyncSuccessMsg('Client ID tersimpan.');
                  }}
                  className="px-2 py-0.5 bg-[#211c38] text-[#ffd700] border border-[#3b335c] hover:border-[#ffd700] cursor-pointer text-[10px]"
                >
                  Update Client ID
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PixelModal>
  );
};
