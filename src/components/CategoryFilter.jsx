const CATEGORIES = ['All', 'Books', 'Electronics', 'Clothing', 'Furniture', 'Other']

const CATEGORY_EMOJI = {
  'All': '✨',
  'Books': '📚',
  'Electronics': '💻',
  'Clothing': '👕',
  'Furniture': '🪑',
  'Other': '📦',
}

export default function CategoryFilter({ selected, onSelect }) {
  const inactiveStyle = {
    background: 'var(--color-card)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-border)',
    boxShadow: '2px 2px 0px 0px var(--color-border)',
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          id={`filter-${cat.toLowerCase()}`}
          onClick={() => onSelect(cat)}
          className={`text-sm font-black uppercase tracking-wider px-4 py-2 border-[3px] transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-border)] ${
            selected === cat
              ? 'bg-[#FF3366] text-white border-[var(--color-border)] shadow-[4px_4px_0px_0px_var(--color-border)]'
              : ''
          }`}
          style={selected === cat ? undefined : inactiveStyle}
        >
          {CATEGORY_EMOJI[cat]} {cat}
        </button>
      ))}
    </div>
  )
}
