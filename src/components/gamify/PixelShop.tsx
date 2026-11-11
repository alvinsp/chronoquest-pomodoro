import React, { useState } from 'react';
import { ShoppingBag, Coins, Check, Sparkles } from 'lucide-react';
import { useGamifyStore } from '../../store/useGamifyStore';
import { PixelModal } from '../ui/PixelModal';
import { PixelButton } from '../ui/PixelButton';

interface PixelShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixelShopModal: React.FC<PixelShopModalProps> = ({ isOpen, onClose }) => {
  const { hero, shopItems, buyShopItem, equipShopItem } = useGamifyStore();
  const [activeTab, setActiveTab] = useState<'avatar' | 'pet' | 'theme'>('avatar');

  const filteredItems = shopItems.filter((item) => item.category === activeTab);

  return (
    <PixelModal isOpen={isOpen} onClose={onClose} title="🏪 Chrono Pixel Armory & Shop" maxWidth="lg">
      <div className="space-y-4">
        {/* User Balance Header */}
        <div className="flex items-center justify-between p-3 bg-[#130f20] border-2 border-[#ffd700] mb-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#ff0055]" />
            <span className="font-silkscreen text-xs text-[#d3cbe7]">Kantung Koinmu:</span>
          </div>
          <div className="flex items-center gap-1.5 font-pixel text-sm text-[#ffd700]">
            <Coins size={16} />
            <span>{hero.gold} GOLD</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b-2 border-[#2b2545] pb-2">
          {(['avatar', 'pet', 'theme'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 font-silkscreen text-xs uppercase cursor-pointer border-2 transition-all ${
                activeTab === tab
                  ? 'bg-[#ff0055] text-white border-black shadow-[2px_2px_0px_#000]'
                  : 'bg-[#181528] text-[#9f97ba] border-[#362f54] hover:text-white'
              }`}
            >
              {tab === 'avatar' ? '🧙 Karakter' : tab === 'pet' ? '🐾 Peliharaan' : '🎨 Tema Tampilan'}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const canAfford = hero.gold >= item.price;
            return (
              <div
                key={item.id}
                className={`p-3.5 border-2 flex flex-col justify-between gap-3 ${
                  item.equipped
                    ? 'bg-[#1e1736] border-[#00f0ff] shadow-[2px_2px_0px_#000]'
                    : item.purchased
                    ? 'bg-[#181528] border-[#362f54]'
                    : 'bg-[#120f20] border-[#292241]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 flex items-center justify-center text-3xl bg-[#09080e] border-2 border-[#3b335c] shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-silkscreen text-xs font-bold text-[#f0edf6] truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-[#a097bd] mt-0.5 leading-snug">{item.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2b2545]">
                  {!item.purchased ? (
                    <div className="flex items-center gap-1 font-pixel text-xs text-[#ffd700]">
                      <Coins size={13} />
                      <span>{item.price} G</span>
                    </div>
                  ) : item.equipped ? (
                    <span className="font-pixel text-[10px] text-[#00f0ff] flex items-center gap-1">
                      <Sparkles size={12} /> AKTIF
                    </span>
                  ) : (
                    <span className="font-silkscreen text-xs text-[#00ff66] flex items-center gap-1">
                      <Check size={13} /> Dimiliki
                    </span>
                  )}

                  <div>
                    {item.equipped ? (
                      <span className="text-[10px] font-pixel text-[#00f0ff] px-2.5 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]">
                        DIPAKAI
                      </span>
                    ) : item.purchased ? (
                      <PixelButton
                        variant="retro-dark"
                        size="sm"
                        onClick={() => equipShopItem(item.id)}
                      >
                        Pasang
                      </PixelButton>
                    ) : (
                      <PixelButton
                        variant={canAfford ? 'accent' : 'retro-dark'}
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => buyShopItem(item.id)}
                      >
                        Beli Item
                      </PixelButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PixelModal>
  );
};

