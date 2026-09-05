interface KevQuoteWidgetProps {
    className?: string
}

export function KevQuoteWidget({ className = '' }: KevQuoteWidgetProps) {
    return (
        <div
            className={`w-36 h-36 bg-white text-neutral-900 rounded-[24px] p-4 shadow-2xl flex flex-col justify-between select-none ${className}`}
        >
            <div className="pt-1">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-neutral-950 leading-snug">
                    "AND IF NOT, HE IS STILL GOOD."
                </h3>
            </div>

            <div className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase">
                DANIEL 3:18
            </div>
        </div>
    )
}
