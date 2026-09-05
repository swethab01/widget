interface KevComicWidgetProps {
    className?: string
}

export function KevComicWidget({ className = '' }: KevComicWidgetProps) {
    return (
        <div
            className={`w-36 h-[308px] rounded-[24px] overflow-hidden shadow-2xl relative border border-white/20 select-none bg-black group ${className}`}
        >
            <img
                src="/spiderman-comic.jpg"
                alt="Spider-Man Comic Art"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
        </div>
    )
}
