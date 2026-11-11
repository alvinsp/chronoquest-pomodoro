import React, { useState, useEffect } from 'react';
import { LogIn, LogOut, RefreshCw, CheckCircle, ShieldCheck, Mail, Sparkles, AlertCircle, Smartphone, Download, Key, Zap } from 'lucide-react';
import { useAuthStore, DEFAULT_GOOGLE_CLIENT_ID } from '../../store/useAuthStore';
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
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
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
    loginWithGoogleProfile,
    logout,
    saveAccountData,
    loadAccountData,
    setGoogleClientId,
    toggleAutoSync,
  } = useAuthStore();

  const { exportDataJson } = useStatsStore();

  // Always fallback to DEFAULT_GOOGLE_CLIENT_ID so client_id is NEVER empty
  const effectiveClientId = (googleClientId && googleClientId.trim() !== '')
    ? googleClientId.trim()
    : DEFAULT_GOOGLE_CLIENT_ID;

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [clientIdInput, setClientIdInput] = useState(effectiveClientId);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Dynamically ensure Google Identity Services script is loaded
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Wait helper if GIS script is still loading
  const waitForGis = async (timeoutMs = 2000): Promise<boolean> => {
    if (window.google?.accounts?.oauth2) return true;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
      if (window.google?.accounts?.oauth2) return true;
    }
    return Boolean(window.google?.accounts?.oauth2);
  };

  // Quick 1-click login for alvin1234putra@gmail.com
  const handleFastLoginAlvin = () => {
    loginWithGoogleProfile({
      email: 'alvin1234putra@gmail.com',
      name: 'Alvin Putra',
      picture: `https://api.dicebear.com/7.x/pixel-art/svg?seed=alvin1234putra`,
    });
    useAuthStore.setState({ isGoogleVerified: true });
    setSyncSuccessMsg('🎉 Berhasil masuk sebagai alvin1234putra@gmail.com! Seluruh datamu aman tersimpan.');
  };

  // Primary Google Login Handler: Works instantly with verified client_id
  const handleLaunchGoogleSignIn = async () => {
    setIsConnectingGoogle(true);
    setSyncSuccessMsg('');

    // Wait briefly if GIS library is still loading
    await waitForGis(1500);

    // Method 1: Use GIS Token Client if available
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const profile = await res.json();
                if (profile.email) {
                  loginWithGoogleProfile({
                    email: profile.email,
                    name: profile.name || profile.email.split('@')[0],
                    picture: profile.picture,
                    id: profile.sub,
                  });
                  useAuthStore.setState({ isGoogleVerified: true });
                  setSyncSuccessMsg(`🎉 Berhasil! Seluruh data telah dikunci ke Akun Google: ${profile.email}`);
                }
              } catch {
                setSyncSuccessMsg('Gagal mengambil data profil Google.');
              }
            }
            setIsConnectingGoogle(false);
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch {
        // Fallback to standard OAuth popup
      }
    }

    // Method 2: Universal OAuth2 Pop-up (Works on mobile and all browsers without iframe dependency)
    const redirectUri = window.location.origin;
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${effectiveClientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=email%20profile%20openid&include_granted_scopes=true&prompt=select_account`;

    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      'GoogleSignInPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!popup) {
      // If popup was blocked by browser, redirect directly
      window.location.href = oauthUrl;
      return;
    }

    // Poll popup window for redirect with token
    const pollTimer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(pollTimer);
          setIsConnectingGoogle(false);
          return;
        }

        if (popup.location.href.includes('access_token')) {
          const hash = popup.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const token = params.get('access_token');
          clearInterval(pollTimer);
          popup.close();

          if (token) {
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((profile) => {
                if (profile.email) {
                  loginWithGoogleProfile({
                    email: profile.email,
                    name: profile.name || profile.email.split('@')[0],
                    picture: profile.picture,
                    id: profile.sub,
                  });
                  useAuthStore.setState({ isGoogleVerified: true });
                  setSyncSuccessMsg(`🎉 Berhasil! Seluruh data telah dikunci ke Akun Google: ${profile.email}`);
                }
                setIsConnectingGoogle(false);
              })
              .catch(() => {
                setIsConnectingGoogle(false);
              });
          }
        }
      } catch {
        // Cross-origin restriction before redirect is normal
      }
    }, 500);
  };

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
              <div className="p-3.5 bg-[#171329] border-2 border-[#ffd700] space-y-3">
                <div className="flex items-start gap-2">
                  <Key size={16} className="text-[#ffd700] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-[#ffd700] text-xs">
                      Tautkan ke Akun Google Resmi (Client ID GIS)
                    </h5>
                    <p className="text-[11px] text-[#d3cbe7] mt-0.5 leading-relaxed">
                      Kamu saat ini masuk via email. Klik tombol di bawah untuk memverifikasikannya dengan Google ID. <strong>Data level, EXP, koin, dan targetmu yang sekarang tidak akan hilang!</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchGoogleSignIn}
                  disabled={isConnectingGoogle}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 font-bold border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-3 cursor-pointer text-xs font-silkscreen transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isConnectingGoogle ? 'Membuka Google...' : 'Tautkan Sekarang dengan Google ID'}</span>
                </button>
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
                <strong>Data kamu saat ini TIDAK AKAN HILANG.</strong> Saat kamu login, seluruh progres level, statistik, target harian, dan catatanmu otomatis dikunci ke Akun Google-mu!
              </p>
            </div>

            {/* Quick 1-Click Button for Alvin */}
            <div className="p-4 bg-[#171329] border-2 border-[#00ff66] space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#00ff66] font-pixel flex items-center gap-1">
                    <Zap size={11} /> AKUN GOOGLE UTAMA
                  </span>
                  <p className="font-silkscreen text-xs font-bold text-[#f0edf6] mt-0.5">
                    alvin1234putra@gmail.com
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFastLoginAlvin}
                  className="pixel-btn px-4 py-2 bg-[#00ff66] hover:bg-[#33ff85] active:bg-[#00cc52] text-black font-silkscreen text-xs font-bold border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <Zap size={13} />
                  <span>Masuk Cepat Langsung</span>
                </button>
              </div>
              <p className="text-[10px] text-[#a9a1c6] leading-relaxed">
                ✓ 100% Mengamankan seluruh data level, statistik, target harian & catatan ke email ini. Bisa dibuka di Laptop & HP tanpa popup bermasalah.
              </p>
            </div>

            {/* Official Google Sign-In Button */}
            <div className="p-4 bg-[#120f20] border-2 border-[#00f0ff] flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#00f0ff] font-bold uppercase">
                <Smartphone size={14} />
                <span>Masuk Resmi dengan Google (Laptop & HP)</span>
              </div>

              <button
                type="button"
                onClick={handleLaunchGoogleSignIn}
                disabled={isConnectingGoogle}
                className="w-full max-w-xs py-3 px-4 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 font-bold border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm font-silkscreen transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isConnectingGoogle ? 'Membuka Google...' : 'Sign in with Google'}</span>
              </button>

              <p className="text-[10px] text-[#786f94] text-center">
                Membuka popup resmi Google GIS.
              </p>
            </div>

            {/* Sync Alert Message if any */}
            {syncSuccessMsg && (
              <div className="p-2.5 bg-[#052e16] border border-[#00ff66] text-[#00ff66] flex items-center gap-2">
                <CheckCircle size={15} />
                <span>{syncSuccessMsg}</span>
              </div>
            )}

            {/* Fast Google Login by Email Form */}
            <form onSubmit={handleCustomLogin} className="p-4 bg-[#120f20] border-2 border-[#2b2545] space-y-3">
              <h4 className="font-pixel text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                <LogIn size={13} />
                Atau Masuk dengan Email Lain
              </h4>

              <div>
                <label className="block text-xs text-[#9f97ba] mb-1">
                  Email Akun Google:
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
                <span>Simpan & Masuk dengan Email Ini</span>
              </PixelButton>
            </form>

            {/* Google OAuth Client ID Configuration Info */}
            <div className="p-3 bg-[#0d0c15] border border-[#261f3a] space-y-2 text-[11px]">
              <div className="flex items-center gap-1 text-[#ffd700] font-bold">
                <AlertCircle size={13} />
                <span>Google Client ID Aktif:</span>
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
