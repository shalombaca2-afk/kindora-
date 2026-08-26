import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SHOP_ITEMS } from '../data/shopData';
import { ShopItem } from '../types';
import { ShoppingBag, Sparkles, Check, Heart, ShieldCheck, Star } from 'lucide-react';

export const ShopView: React.FC = () => {
  const {
    coins,
    inventory,
    equippedHat,
    equippedGlasses,
    equippedOutfit,
    buyItem,
    equipItem,
    unequipItem,
    playSound,
    speak,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'accessory' | 'toy'>('all');

  const filteredItems = SHOP_ITEMS.filter((item) =>
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const handleBuy = (item: ShopItem) => {
    const success = buyItem(item);
    if (success) {
      speak(`¡Compraste ${item.name}!`);
    } else {
      speak(`Te faltan monedas para comprar ${item.name}. ¡Sigue jugando actividades para ganar más monedas!`);
    }
  };

  const isEquipped = (item: ShopItem) => {
    if (item.slot === 'hat') return equippedHat === item.id;
    if (item.slot === 'glasses') return equippedGlasses === item.id;
    if (item.slot === 'outfit') return equippedOutfit === item.id;
    return false;
  };

  const isOwned = (item: ShopItem) => {
    return inventory.includes(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 id="shop-title" className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>🛍️</span> Tienda Kindora
          </h1>
          <p id="shop-hint" className="text-base font-semibold text-slate-500 mt-1">
            Compra accesorios y premios para tu mascota con tus monedas ganadas.
          </p>
        </div>

        {/* User Balance */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs">
          <span className="text-2xl">🪙</span>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider">Tus Monedas</span>
            <span className="text-2xl font-black text-amber-950 leading-none">{coins}</span>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Todos los productos', icon: '🌟' },
          { id: 'accessory', label: 'Accesorios y Ropa', icon: '🎩' },
          { id: 'food', label: 'Alimentos y Premios', icon: '🍎' },
          { id: 'toy', label: 'Juguetes', icon: '🎾' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playSound('pop');
              setActiveCategory(cat.id as any);
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap border-2 cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#f97316] text-white border-[#f97316] shadow-sm scale-103'
                : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const owned = isOwned(item);
          const equipped = isEquipped(item);
          const canAfford = coins >= item.price;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border-2 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                equipped ? 'border-[#f97316] ring-2 ring-orange-200' : 'border-slate-200 hover:border-sky-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-4xl shadow-inner">
                  {item.icon}
                </div>
                {equipped ? (
                  <span className="px-2.5 py-1 bg-[#f97316] text-white text-xs font-black rounded-full shadow-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> Puesto
                  </span>
                ) : owned && item.category === 'accessory' ? (
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-black rounded-full">
                    En mochila
                  </span>
                ) : (
                  <div className="flex items-center gap-1 font-black text-amber-900 text-base bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                    <span>🪙</span>
                    <span>{item.price}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-800">{item.name}</h3>
                <p className="text-xs font-semibold text-slate-500 line-clamp-2">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {item.category === 'accessory' && owned ? (
                  equipped ? (
                    <button
                      onClick={() => unequipItem(item.slot!)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Quitar accesorio
                    </button>
                  ) : (
                    <button
                      onClick={() => equipItem(item)}
                      className="w-full py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Poner a mi mascota
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-[#f97316] hover:bg-[#ea580c] text-white cursor-pointer active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🪙 Comprar por {item.price}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
