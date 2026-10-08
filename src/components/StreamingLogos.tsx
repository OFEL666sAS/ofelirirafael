interface BrandMark {
  name: string;
  svg: string;
  bg: string;
}

const BRANDS: BrandMark[] = [
  { name: 'Netflix', bg: '#E50914', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M5 2v20l4-1.5V14l4 7.5 5 1.5V2h-4v12L10 7 5 2z"/></svg>` },
  { name: 'Spotify', bg: '#1DB954', svg: `<svg viewBox="0 0 24 24" fill="black"><circle cx="12" cy="12" r="10" fill="black"/><path fill="#1DB954" d="M7 9c4-1 8-1 11 1M8 12c3-1 6-1 9 1M9 15c2-1 4-1 6 1"/></svg>` },
  { name: 'YouTube', bg: '#FF0000', svg: `<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4" fill="white"/><path fill="#FF0000" d="M10 9l5 3-5 3z"/></svg>` },
  { name: 'Disney+', bg: '#0C1130', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M3 8c3-1 5-1 8 0 3-1 5-1 8 0v8c-3-1-5-1-8 0-3-1-5-1-8 0V8z"/></svg>` },
  { name: 'HBO Max', bg: '#0C1130', svg: `<svg viewBox="0 0 24 24" fill="white"><text x="12" y="16" text-anchor="middle" font-size="7" font-weight="bold" fill="white" font-family="sans-serif">Max</text></svg>` },
  { name: 'Prime Video', bg: '#00A8E1', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M12 4l8 12H4z M4 18h16l-2 2H6z"/></svg>` },
  { name: 'Crunchyroll', bg: '#F47521', svg: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="2" fill="none"/><path d="M12 7v5l3 2" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>` },
  { name: 'Twitch', bg: '#9146FF', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 3h16v11l-4 4h-4l-3 3v-3H4V3zm2 2v9h3v3l3-3h3l3-3V5H6zm3 2h2v4H9V7zm5 0h2v4h-2V7z"/></svg>` },
  { name: 'Apple TV+', bg: '#000000', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M16 3c-1 .5-2 1.5-2 3 1 0 2-1 2-3zM14 7c-1 0-2 .5-3 .5-1 0-2-.5-3-.5-1.5 0-3 1-4 3 1.5 3 3 5 4.5 5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c1.5 0 3-2 4-5-1.5-1-2.5-2-4-3z"/></svg>` },
  { name: 'Paramount+', bg: '#0064FF', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M12 4c-3 2-5 4-5 7s2 5 5 5 5-2 5-5-2-5-5-7z M6 18h12v2H6z"/></svg>` },
  { name: 'ChatGPT', bg: '#10A37F', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M12 4l2 3 3 1-1 3 1 3-3 1-2 3-2-3-3-1 1-3-1-3 3-1 2-3z"/></svg>` },
  { name: 'Canva Pro', bg: '#00C4CC', svg: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><path d="M9 9c1-1 3-1 4 0M15 15c-1 1-3 1-4 0" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>` },
  { name: 'Notion', bg: '#FFFFFF', svg: `<svg viewBox="0 0 24 24" fill="black"><path d="M5 4h10l4 4v12H5V4zm2 2v12h10V9h-3V6H7z"/></svg>` },
  { name: 'Adobe', bg: '#FA0F00', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 4h6l4 16h-6L4 4zm10 0h6l-2 8-4-8z"/></svg>` },
  { name: 'CapCut', bg: '#00D4EC', svg: `<svg viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="9" fill="none" stroke="white" stroke-width="2"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>` },
  { name: 'Office 365', bg: '#D83B01', svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M4 5l12-3v20l-12-3V5zm5 5v6l4 1V9l-4 1z"/></svg>` },
];

export function StreamingLogos() {
  return (
    <section className="py-6 sm:py-8 border-t border-gold-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs sm:text-sm text-gray-500 mb-5 uppercase tracking-widest font-medium">
          Plataformas disponibles
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="group flex flex-col items-center justify-center gap-2 aspect-square rounded-2xl border border-white/5 transition-all duration-300 hover:scale-105 hover:border-gold-500/20 cursor-default overflow-hidden"
              style={{ backgroundColor: brand.bg }}
            >
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: brand.svg }}
              />
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-tight text-center px-1 leading-tight"
                style={{ color: brand.bg === '#FFFFFF' ? '#000' : '#fff' }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
