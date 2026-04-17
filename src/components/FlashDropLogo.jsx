export default function FlashDropLogo({ size = 'nav' }) {
  if (size === 'hero') {
    return (
      <span className="inline-flex items-center gap-1 text-4xl md:text-7xl font-black uppercase tracking-tighter text-text-main">
        <span>⚡</span>
        <span>Flash</span>
        <span
          className="glitch-container inline-block px-2 border-[4px] border-border-main -rotate-2 ml-1 shadow-[8px_8px_0px_0px_var(--shadow-hard)]"
          data-text="DROP"
          style={{ background: '#ff3366' }}
        >
          DROP
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2 min-w-0">
      <span className="text-lg sm:text-2xl">⚡</span>
      <span className="text-sm sm:text-xl font-black tracking-tight truncate text-text-main inline-flex items-center gap-1 leading-none">
        <span>Flash</span>
        <span
          className="inline-flex items-center justify-center px-1.5 sm:px-2 h-[1.45em] leading-none border-[3px] sm:border-[4px] border-border-main shadow-[6px_6px_0px_0px_var(--shadow-hard)]"
          style={{ background: '#ff3366' }}
        >
          DROP
        </span>
      </span>
    </span>
  )
}
