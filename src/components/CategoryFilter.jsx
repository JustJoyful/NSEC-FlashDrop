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
    background: 'var(--card-main)',
    color: 'var(--text-main)',
    borderColor: 'var(--border-main)',
    boxShadow: '4px 4px 0px 0px var(--shadow-hard)',
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          id={`filter-${cat.toLowerCase()}`}
          onClick={() => onSelect(cat)}
          className={`text-sm font-black uppercase tracking-wider px-4 py-2 border-[4px] transition-all duration-200 transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--shadow-hard)] ${
            selected === cat
              ? 'bg-flash-pink text-white border-border-main shadow-[4px_4px_0px_0px_var(--shadow-hard)]'
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
