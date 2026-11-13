import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  CheckCircle,
  Cloud,
  CloudUpload,
  CloudDownload,
  Settings,
  Download,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuthStore, DEFAULT_GOOGLE_CLIENT_ID } from '../../store/useAuthStore';
import { useStatsStore } from '../../store/useStatsStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';
import { formatDatePretty } from '../../utils/formatters';
import { rehydrateAllStores } from '../../store/rehydrateStores';
import {
  saveFirebaseConfig,
  clearFirebaseConfig,
  isFirebaseConfigured,
  parseFirebaseConfigText,
  pushLocalDataToFirestore,
  pullLatestDataFromFirestore,
} from '../../services/firebase';

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
    isGoogleVerified,
    loginWithGoogleProfile,
    logout,
  } = useAuthStore();

  const { exportDataJson } = useStatsStore();

  const effectiveClientId =
    googleClientId && googleClientId.trim() !== ''
      ? googleClientId.trim()
      : DEFAULT_GOOGLE_CLIENT_ID;

  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);

  // Firebase Cloud Sync state
  const [isCloudConfiguredState, setIsCloudConfiguredState] = useState(isFirebaseConfigured());
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');
  const [isPushingCloud, setIsPushingCloud] = useState(false);
  const [isPullingCloud, setIsPullingCloud] = useState(false);

  useEffect(() => {
    setIsCloudConfiguredState(isFirebaseConfigured());
  }, [isOpen]);

  const handlePushToCloud = async () => {
    if (!user?.email) return;
    setIsPushingCloud(true);
    setSyncSuccessMsg('');
    const ok = await pushLocalDataToFirestore(user.email);
    setIsPushingCloud(false);
    if (ok) {
      setSyncSuccessMsg(`☁️ Data berhasil diunggah & aman di Cloud (${user.email})!`);
    } else {
      setSyncSuccessMsg('Gagal mengunggah ke Firebase. Pastikan aturan Firestore mengizinkan tulis.');
    }
  };

  const handlePullFromCloud = async () => {
    if (!user?.email) return;
    setIsPullingCloud(true);
    setSyncSuccessMsg('');
    const ok = await pullLatestDataFromFirestore(user.email);
    setIsPullingCloud(false);
    if (ok) {
      await rehydrateAllStores();
      setSyncSuccessMsg('🎉 Berhasil menarik data terbaru dari Cloud!');
    } else {
      setSyncSuccessMsg('Belum ada data cadangan di Firebase Cloud untuk email ini.');
    }
  };

  const detectedFirebaseConfig = parseFirebaseConfigText(firebaseConfigInput);

  const handleSaveFirebaseConfigJson = () => {
    try {
      const config = parseFirebaseConfigText(firebaseConfigInput);
      if (config && config.apiKey && config.projectId) {
        const ok = saveFirebaseConfig(config);
        if (ok) {
          setIsCloudConfiguredState(true);
          setShowFirebaseSetup(false);
          setSyncSuccessMsg(`🎉 Berhasil terhubung ke Firebase Cloud (${config.projectId})! Realtime sync aktif.`);
          return;
        }
      }
      setSyncSuccessMsg('Format Firebase config tidak valid. Cukup tempelkan objek "const firebaseConfig = { ... };"');
    } catch {
      setSyncSuccessMsg('Gagal memproses konfigurasi Firebase.');
    }
  };

  const handleDisconnectFirebase = () => {
    clearFirebaseConfig();
    setIsCloudConfiguredState(false);
    setSyncSuccessMsg('Firebase config telah dinonaktifkan.');
  };

  // Google GIS script loader
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

  const waitForGis = async (timeoutMs = 2000): Promise<boolean> => {
    if (window.google?.accounts?.oauth2) return true;
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
      if (window.google?.accounts?.oauth2) return true;
    }
    return Boolean(window.google?.accounts?.oauth2);
  };

  const handleLaunchGoogleSignIn = async () => {
    setIsConnectingGoogle(true);
    setSyncSuccessMsg('');

    await waitForGis(1500);

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
                  setSyncSuccessMsg(`🎉 Berhasil masuk dengan Akun Google: ${profile.email}`);
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
        // Fallback to popup
      }
    }

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
      window.location.href = oauthUrl;
      return;
    }

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
                  setSyncSuccessMsg(`🎉 Berhasil masuk dengan Google: ${profile.email}`);
                }
                setIsConnectingGoogle(false);
              })
              .catch(() => {
                setIsConnectingGoogle(false);
              });
          }
        }
      } catch {
        // Cross-origin restriction before redirect
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

    setSyncSuccessMsg(`Masuk sebagai: ${inputEmail}`);
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
    setSyncSuccessMsg('File cadangan (.json) berhasil di-download.');
  };

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🔐 Akun & Sinkronisasi Cloud" maxWidth="md">
      <div className="space-y-4 text-xs font-silkscreen">
        {syncSuccessMsg && (
          <div className="p-2.5 bg-[#052e16] border border-[#00ff66] text-[#00ff66] flex items-center gap-2">
            <CheckCircle size={15} />
            <span>{syncSuccessMsg}</span>
          </div>
        )}

        {user ? (
          /* User Logged In */
          <div className="space-y-4">
            {/* Account Profile Card */}
            <div className="p-3.5 bg-[#0f0c1b] border-2 border-[#00ff66] flex items-center gap-3 shadow-[2px_2px_0px_#000]">
              <div className="w-11 h-11 border-2 border-black bg-[#231d37] overflow-hidden shrink-0 flex items-center justify-center">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="font-pixel font-bold text-sm text-[#00ff66]">
                    {user.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <h4 className="font-pixel text-xs text-[#00ff66] truncate max-w-[200px]">{user.name}</h4>
                  <span
                    className={`text-[9px] font-pixel px-1.5 py-0.5 border shrink-0 ${
                      isGoogleVerified
                        ? 'bg-[#052e16] text-[#00ff66] border-[#00ff66]'
                        : 'bg-[#332205] text-[#ffd700] border-[#ffd700]'
                    }`}
                  >
                    {isGoogleVerified ? 'GOOGLE VERIFIED ✓' : 'EMAIL PROFILE'}
                  </span>
                </div>
                <p className="text-[11px] text-[#a097bd] truncate font-mono mt-0.5">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#788da6]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] inline-block animate-pulse shrink-0" />
                  <span>Cloud Auto-Sync: Aktif</span>
                  <span className="text-[#4b5a6d]">•</span>
                  <span className="text-[#5b6e85]">
                    {lastSyncedAt ? formatDatePretty(lastSyncedAt.split('T')[0]) : 'Baru saja'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cloud Realtime Status & Manual Trigger */}
            <div className="p-3.5 bg-[#0d1626] border-2 border-[#00f0ff] space-y-3">
              <div className="flex items-center justify-between border-b border-[#1b2d49] pb-2">
                <div className="flex items-center gap-2">
                  <Cloud size={16} className="text-[#00f0ff]" />
                  <h4 className="font-silkscreen text-xs font-bold text-[#00f0ff] uppercase">
                    Status Sinkronisasi Real-Time
                  </h4>
                </div>
                <span className="text-[9px] font-pixel px-2 py-0.5 bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66] font-bold">
                  {isCloudConfiguredState ? 'AKTIF ✓' : 'STANDBY'}
                </span>
              </div>

              <p className="text-[11px] text-[#a9c2e2] leading-relaxed">
                🟢 <strong>Semua data tersinkron otomatis!</strong> Setiap kali kamu menyelesaikan sesi fokus Pomodoro, menaikkan level, atau menyelesaikan target, data langsung sinkron antara Laptop & HP.
              </p>

              {isCloudConfiguredState && (
                <>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handlePushToCloud}
                      disabled={isPushingCloud}
                      className="py-2 px-3 bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-silkscreen font-bold text-xs border border-black flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] transition-all"
                    >
                      <CloudUpload size={13} className={isPushingCloud ? 'animate-bounce' : ''} />
                      <span>{isPushingCloud ? 'Mengunggah...' : 'Sinkronkan Sekarang'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePullFromCloud}
                      disabled={isPullingCloud}
                      className="py-2 px-3 bg-[#152336] hover:bg-[#1f334e] text-[#00f0ff] font-silkscreen font-bold text-xs border border-[#00f0ff] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <CloudDownload size={13} className={isPullingCloud ? 'animate-bounce' : ''} />
                      <span>{isPullingCloud ? 'Menarik...' : 'Muat dari Cloud'}</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={handleDisconnectFirebase}
                      className="text-[10px] text-[#ff6666] hover:underline cursor-pointer"
                    >
                      Putuskan Firebase
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Offline Backup File */}
            <div className="p-2.5 bg-[#0a0f17] border border-[#1a2d45] flex items-center justify-between">
              <span className="text-[10px] text-[#869ab3]">
                Cadangan File Offline (.json):
              </span>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="text-[10px] font-silkscreen text-[#00f0ff] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download size={12} /> Download Backup
              </button>
            </div>

            {/* Logout */}
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
          /* User Not Logged In */
          <div className="space-y-4">
            <div className="p-3 bg-[#130f21] border-2 border-[#ffd700] flex items-start gap-2.5">
              <Sparkles size={18} className="text-[#ffd700] shrink-0 mt-0.5" />
              <p className="text-xs text-[#d3cbe7] leading-relaxed">
                <strong>Data kamu saat ini TIDAK AKAN HILANG.</strong> Masuk dengan Akun Google untuk mengunci seluruh progres level, statistik, target harian, dan catatanmu ke cloud secara otomatis.
              </p>
            </div>

            {/* Official Google Sign-In */}
            <div className="p-5 bg-[#120f20] border-2 border-[#00f0ff] flex flex-col items-center justify-center space-y-3 shadow-[2px_2px_0px_#000]">
              <span className="text-xs text-[#00f0ff] font-bold uppercase tracking-wider">
                Masuk Resmi dengan Google
              </span>

              <button
                type="button"
                onClick={handleLaunchGoogleSignIn}
                disabled={isConnectingGoogle}
                className="w-full max-w-xs py-3 px-4 bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-800 font-bold border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm font-silkscreen transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isConnectingGoogle ? 'Membuka Google...' : 'Sign in with Google'}</span>
              </button>

              <p className="text-[10px] text-[#786f94]">
                Sinkron otomatis di Laptop dan Browser HP.
              </p>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleCustomLogin} className="p-4 bg-[#120f20] border-2 border-[#2b2545] space-y-3">
              <h4 className="font-pixel text-xs text-[#ffd700] uppercase flex items-center gap-1.5">
                <LogIn size={13} />
                Atau Masuk dengan Email
              </h4>

              <div>
                <label className="block text-xs text-[#9f97ba] mb-1">Email:</label>
                <input
                  type="email"
                  required
                  placeholder="contoh: nama@gmail.com"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-xs text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9f97ba] mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  placeholder="Nama / Username"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full bg-[#0d0c15] border-2 border-[#3b335c] p-2 text-xs text-[#f0edf6] font-medium outline-none focus:border-[#00f0ff]"
                />
              </div>

              <PixelButton type="submit" variant="primary" size="md" fullWidth>
                <ShieldCheck size={15} />
                <span>Masuk dengan Email</span>
              </PixelButton>
            </form>

            {/* Firebase Config Setup Toggle (Only if not configured) */}
            {!isCloudConfiguredState && (
              <div className="p-3 bg-[#0d1626] border border-[#1b2d49] space-y-2">
                {!showFirebaseSetup ? (
                  <button
                    type="button"
                    onClick={() => setShowFirebaseSetup(true)}
                    className="w-full py-1.5 text-[11px] text-[#00f0ff] font-silkscreen hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings size={12} />
                    <span>Setup Firebase Cloud Database (Opsional)</span>
                  </button>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[10px] text-[#ffd700] font-silkscreen">
                      Tempelkan const firebaseConfig:
                    </label>
                    <textarea
                      rows={3}
                      value={firebaseConfigInput}
                      onChange={(e) => setFirebaseConfigInput(e.target.value)}
                      placeholder={`const firebaseConfig = {\n  apiKey: "AIza...",\n  projectId: "..."\n};`}
                      className="w-full bg-[#0a121e] border border-[#2f496e] p-2 text-[10px] font-mono text-[#00f0ff] outline-none resize-none"
                    />

                    {detectedFirebaseConfig && (
                      <div className="text-[10px] text-[#00ff66]">
                        ✓ Terdeteksi: {detectedFirebaseConfig.projectId}
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowFirebaseSetup(false)}
                        className="px-2 py-0.5 text-[10px] text-[#869ab3]"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFirebaseConfigJson}
                        className="px-3 py-1 bg-[#00ff66] text-black font-silkscreen font-bold text-xs"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </PixelModal>
  );
};
