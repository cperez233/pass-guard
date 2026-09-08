/** Primitivas de interfaz compartidas por el generador y el auditor. */

export function Card({ className = '', children, ...props }) {
  return (
    <section
      className={`glass rounded-2xl p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export function SectionTitle({ icon: Icon, title, description, action }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-400/20">
            <Icon className="size-4.5" strokeWidth={2} />
          </span>
        ) : null}
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </header>
  )
}

/** Interruptor accesible: un <button> con role de switch, no un checkbox oculto. */
export function Toggle({ icon: Icon, label, hint, checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-40 ${
        checked
          ? 'border-cyan-400/30 bg-cyan-500/8 shadow-[0_0_24px_-12px] shadow-cyan-400/50'
          : 'border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4'
      }`}
    >
      {Icon ? (
        <Icon
          className={`size-4 shrink-0 transition-colors ${checked ? 'text-cyan-300' : 'text-slate-500'}`}
          strokeWidth={2}
        />
      ) : null}

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-xs font-medium transition-colors ${
            checked ? 'text-slate-100' : 'text-slate-400'
          }`}
        >
          {label}
        </span>
        {hint ? (
          <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">{hint}</span>
        ) : null}
      </span>

      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? 'bg-cyan-500/80' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function Stat({ icon: Icon, label, value, unit, accent = 'text-slate-100' }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/2 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {Icon ? <Icon className="size-3" strokeWidth={2.5} /> : null}
        {label}
      </div>
      <div className={`mt-1.5 font-mono text-lg leading-none font-semibold ${accent}`}>
        {value}
        {unit ? <span className="ml-1 text-[11px] font-normal text-slate-500">{unit}</span> : null}
      </div>
    </div>
  )
}
