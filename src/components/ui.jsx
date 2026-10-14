/** Primitivas de interfaz compartidas por el generador y el auditor. */
/* editorial-ui · Cristian Pérez · cristianperez.me */

export function Card({ className = '', raised = false, children, ...props }) {
  return (
    <section
      className={`${raised ? 'plate-raised' : 'plate'} rounded-[22px] p-5 sm:p-7 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export function SectionTitle({ icon: Icon, title, description, action }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="font-semiwide flex items-center gap-2.5 text-[1.05rem] leading-tight font-bold tracking-[-0.01em] text-steel-100 sm:text-lg">
          {Icon ? <Icon className="size-[18px] shrink-0 text-brass-400" strokeWidth={2} /> : null}
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-steel-400">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  )
}

/** Interruptor accesible: un <button> con role de switch, no un checkbox oculto. */
export function Toggle({ icon: Icon, label, hint, checked, onChange, disabled = false, disabledHint }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      title={disabled ? disabledHint : undefined}
      className="group flex min-h-14 w-full items-center gap-3.5 px-1 py-3 text-left transition-colors duration-200 active:bg-white/[0.025] disabled:cursor-not-allowed [@media(hover:hover)]:hover:bg-white/[0.02]"
    >
      {Icon ? (
        <Icon
          className={`size-[18px] shrink-0 transition-colors duration-200 ${checked ? 'text-brass-400' : 'text-steel-500'}`}
          strokeWidth={2}
        />
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-medium transition-colors duration-200 ${
            checked ? 'text-steel-100' : 'text-steel-400'
          }`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-0.5 block truncate font-mono text-[13px] text-steel-500">{hint}</span>
        ) : null}
      </span>

      {/* Pista y pin del interruptor: el pin es de latón cuando está activo. */}
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? 'bg-brass-700/80 ring-1 ring-brass-400/50' : 'bg-steel-700 ring-1 ring-white/5'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        <span
          className={`absolute top-1 left-1 size-5 rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.5)] transition-[translate,background-color] duration-300 ease-[var(--ease-spring)] group-active:scale-95 ${
            checked
              ? 'translate-x-5 bg-[radial-gradient(circle_at_35%_30%,#f6e2b4,#d9a74a_55%,#9b6f24)]'
              : 'translate-x-0 bg-steel-400'
          }`}
        />
      </span>
    </button>
  )
}

export function Stat({ icon: Icon, label, value, unit, accent }) {
  return (
    <div className="min-w-0 py-1">
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-steel-400">
        {Icon ? <Icon className="size-3.5 shrink-0" strokeWidth={2.2} /> : null}
        {label}
      </div>
      <div
        className="mt-1.5 font-mono text-[1.35rem] leading-none whitespace-nowrap font-semibold tracking-tight text-steel-100 xl:text-[1.5rem]"
        style={accent ? { color: accent } : undefined}
      >
        {value}
        {unit ? <span className="ml-1.5 text-[13px] font-normal text-steel-500">{unit}</span> : null}
      </div>
    </div>
  )
}
