import { Eye, Clock, Tag } from 'lucide-react';
import type { Product } from '../lib/supabase';
import { priceToUsd, getModality } from '../lib/supabase';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const isOutOfStock = product.status === 'agotado';
  const price = Number(product.price);
  const usd = product.price_usd ? Number(product.price_usd) : priceToUsd(price);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const modality = getModality(product);

  return (
    <div className="group relative flex flex-col bg-dark-800 rounded-2xl border border-gold-500/10 overflow-hidden card-hover h-full">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <div className="px-2.5 py-1 rounded-full gradient-gold text-[10px] font-bold text-dark-900 uppercase tracking-wide">
            {product.badge}
          </div>
        )}
        {product.duration && (
          <div className="px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-sm border border-gold-500/20 text-[10px] font-medium text-gold-300 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {product.duration}
          </div>
        )}
        {modality && (
          <div className="px-2.5 py-1 rounded-full bg-dark-900/80 backdrop-blur-sm border border-gold-500/20 text-[10px] font-medium text-gold-200 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {modality}
          </div>
        )}
      </div>

      {product.discount > 0 && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-red-500/90 text-[10px] font-bold text-white">
          -{product.discount}%
        </div>
      )}

      {isOutOfStock && (
        <div className="absolute inset-0 z-20 bg-dark-900/70 flex items-center justify-center">
          <span className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold">
            AGOTADO
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-dark-750">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain bg-dark-750 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-750 to-dark-800">
            <img src="/ofel-logo.webp" alt="OFELIRIRAFAEL" className="w-16 h-16 object-contain opacity-40" />
          </div>
        )}
      </div>

      {/* Content - flex-grow to align prices and buttons */}
      <div className="flex flex-col flex-grow p-4">
        <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover:text-gold-400 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-1 leading-relaxed">
            {product.description.split('\n')[0]}
          </p>
        )}

        {/* Price section - pinned to bottom */}
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-0.5">
            <span className="text-xl font-black text-white">S/{price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-600 line-through mb-0.5">
                S/{originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-gold-400/70 mb-3">${usd.toFixed(2)} USD</p>

          <button
            onClick={() => onView(product)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg btn-gold-outline text-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );
}
