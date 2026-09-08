interface KevQuoteWidgetProps {
    className?: string
}

export function KevQuoteWidget({ className = '' }: KevQuoteWidgetProps) {
    return (
        <div
            className={`w-36 h-36 bg-white text-neutral-900 rounded-[26px] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.2)] border border-neutral-100 flex flex-col justify-between select-none ${className}`}
        >
            <div className="pt-0.5">
                <h3 className="text-[14px] font-black uppercase tracking-tight text-black leading-[1.25] font-sans">
                    AND IF NOT,
                    <br />
                    HE IS STILL
                    <br />
                    GOOD.
                </h3>
            </div>

            <div className="text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
                DANIEL 3:18
            </div>
        </div>
    )
}
