import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SHOP_ITEMS } from '../data/shopData';
import { Sparkles, Heart, Zap, Apple, Smile, ShoppingBag, Bed, Bath } from 'lucide-react';

export const PetView: React.FC = () => {
  const {
    user,
    petStats,
    feedPet,
    playWithPet,
    restPet,
    interactPetDirectly,
    petActionEffect,
    inventory,
    equippedHat,
    equippedGlasses,
    equippedOutfit,
    setActiveTab,
    playSound,
    speak,
  } = useApp();

  const [showFoodMenu, setShowFoodMenu] = useState(false);

  const getPetEmoji = () => {
    switch (user?.petType) {
      case 'dino':
        return '🦖';
      case 'rabbit':
        return '🐰';
      case 'cat':
        return '🐱';
      default:
        return '🐼';
    }
  };

  const getPetName = () => {
    return user?.petName || (user?.petType === 'dino' ? 'Rexy' : user?.petType === 'rabbit' ? 'Copito' : user?.petType === 'cat' ? 'Misi' : 'Bambú');
  };

  // Find equipped accessory details
  const hatItem = SHOP_ITEMS.find((item) => item.id === equippedHat);
  const glassesItem = SHOP_ITEMS.find((item) => item.id === equippedGlasses);
  const outfitItem = SHOP_ITEMS.find((item) => item.id === equippedOutfit);

  // Filter inventory foods
  const inventoryFoods = inventory
    .map((id) => SHOP_ITEMS.find((item) => item.id === id && item.category === 'food'))
    .filter(Boolean) as typeof SHOP_ITEMS;

  const handleFeed = (foodId?: string) => {
    feedPet(foodId);
    setShowFoodMenu(false);
    speak(`¡Mmm qué rico! A ${getPetName()} le encantó.`);
  };

  const handlePlay = () => {
    const success = playWithPet();
    if (success) {
      speak(`¡A ${getPetName()} le encanta jugar contigo!`);
    } else {
      speak(`${getPetName()} tiene mucho sueño. Déjalo descansar un momento.`);
    }
  };

  const handleRest = () => {
    restPet();
    speak(`Shh... ${getPetName()} está descansando. Ahora tiene 100 de energía.`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-amber-100 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 id="pet-section-title" className="text-3xl sm:text-4xl font-extrabold text-[#344054] tracking-tight flex items-center gap-2">
            <span>🐾</span> Mi mascota
          </h1>
          <p id="pet-hint" className="text-base font-bold text-slate-500 mt-1">
            ¡Cuida y aprende con tu mascota!
          </p>
        </div>

        <button
          onClick={() => setActiveTab('shop')}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-sm rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center gap-2"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Ir a la tienda</span>
        </button>
      </div>

      {/* Main Mascot Stage Card */}
      <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 rounded-3xl p-8 sm:p-12 border-4 border-white shadow-xl text-center space-y-8 overflow-hidden">
        {/* Floating scenery elements */}
        <div className="absolute top-6 left-8 text-3xl opacity-60 animate-float">🌿</div>
        <div className="absolute top-10 right-10 text-3xl opacity-60 animate-float" style={{ animationDelay: '1.2s' }}>🌻</div>
        <div className="absolute bottom-8 left-12 text-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }}>🦋</div>

        {/* Pet Name & Mood Header */}
        <div className="space-y-1">
          <div className="inline-block px-4 py-1.5 bg-white/90 backdrop-blur-xs rounded-full border border-amber-200 shadow-xs">
            <span className="text-sm font-extrabold text-slate-700">
              🐾 {getPetName()}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            {petStats.happiness > 70 ? '¡Muy alegre y con ganas de aprender!' : petStats.hunger < 30 ? 'Tiene un poco de hambre' : 'Tranquilo y relajado'}
          </p>
        </div>

        {/* Mascot Avatar with Accessories */}
        <div className="relative inline-block my-4">
          <button
            onClick={interactPetDirectly}
            className="group relative text-8xl sm:text-9xl p-6 bg-white/60 hover:bg-white/80 rounded-full border-4 border-amber-300 shadow-2xl transition-transform transform hover:scale-110 active:scale-95 cursor-pointer select-none"
            title="¡Haz clic para acariciar y darle amor!"
          >
            {/* Equipped Hat Overlay */}
            {hatItem && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl sm:text-6xl drop-shadow-md animate-bounce">
                {hatItem.icon}
              </span>
            )}

            {/* Main Pet Emoji */}
            <span className="inline-block animate-float">{getPetEmoji()}</span>

            {/* Equipped Glasses Overlay */}
            {glassesItem && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl pointer-events-none">
                {glassesItem.icon}
              </span>
            )}

            {/* Equipped Outfit / Cape Overlay */}
            {outfitItem && (
              <span className="absolute -bottom-2 right-0 text-4xl sm:text-5xl pointer-events-none">
                {outfitItem.icon}
              </span>
            )}

            {/* Interactive Feedback Message */}
            {petActionEffect && (
              <div className="absolute -top-6 -right-6 bg-amber-400 text-slate-900 font-black text-sm px-4 py-2 rounded-2xl shadow-xl border-2 border-white animate-in zoom-in-50 duration-200">
                {petActionEffect}
              </div>
            )}
          </button>
        </div>

        {/* Status Bars Grid matching exact Canva IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-6 rounded-3xl border-2 border-amber-100 shadow-md">
          {/* Hunger Bar */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-sm font-bold text-[#344054]">
              <span id="bar-hunger-label" className="flex items-center gap-1">
                🍎 Hambre
              </span>
              <span className="text-emerald-700 font-extrabold">{petStats.hunger}%</span>
            </div>
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${petStats.hunger}%` }}
              />
            </div>
          </div>

          {/* Happiness Bar */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-sm font-bold text-[#344054]">
              <span id="bar-happy-label" className="flex items-center gap-1">
                😊 Felicidad
              </span>
              <span className="text-amber-700 font-extrabold">{petStats.happiness}%</span>
            </div>
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${petStats.happiness}%` }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-sm font-bold text-[#344054]">
              <span id="bar-energy-label" className="flex items-center gap-1">
                ⚡ Energía
              </span>
              <span className="text-sky-700 font-extrabold">{petStats.energy}%</span>
            </div>
            <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${petStats.energy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Feed */}
          <div className="relative">
            <button
              onClick={() => setShowFoodMenu(!showFoodMenu)}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-base rounded-2xl shadow-md shadow-emerald-200 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Apple className="w-5 h-5" />
              <span>🍎 Alimentar</span>
            </button>

            {/* Food Menu Dropdown */}
            {showFoodMenu && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-3xl p-4 shadow-2xl border-2 border-emerald-200 w-72 text-left z-30 space-y-2 animate-in zoom-in-95 duration-150">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Elige comida del inventario:
                </p>
                {inventoryFoods.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {inventoryFoods.map((f, i) => (
                      <button
                        key={`${f.id}-${i}`}
                        onClick={() => handleFeed(f.id)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-slate-800 transition-all text-left"
                      >
                        <span className="text-2xl">{f.icon}</span>
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">
                      No tienes comida en tu mochila.
                    </p>
                    <button
                      onClick={() => handleFeed()}
                      className="w-full py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl hover:bg-emerald-200"
                    >
                      🍎 Dar manzana gratis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Play */}
          <button
            onClick={handlePlay}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base rounded-2xl shadow-md shadow-amber-200 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Smile className="w-5 h-5" />
            <span>🎾 Jugar</span>
          </button>

          {/* Rest */}
          <button
            onClick={handleRest}
            className="px-6 py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-base rounded-2xl shadow-md shadow-sky-200 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Bed className="w-5 h-5" />
            <span>💤 Descansar</span>
          </button>

          {/* Pet Directly */}
          <button
            onClick={interactPetDirectly}
            className="px-6 py-3.5 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-base rounded-2xl shadow-md shadow-pink-200 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" />
            <span>❤️ Acariciar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
