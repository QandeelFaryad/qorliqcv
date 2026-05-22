export default function SectionTitle({
  label,
  title,
  desc,
  dark = false,
  center = false,
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {/* Label */}
      {label ? (
        <div
          className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 ${
            dark
              ? "border-qorliqGold/30 bg-qorliqGold/10"
              : "border-qorliqGold/25 bg-white"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-qorliqGold" />
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-qorliqGold">
            {label}
          </p>
        </div>
      ) : null}

      {/* Title */}
      <h2
        className={`mt-5 text-4xl font-black leading-[1.02] tracking-[-0.055em] md:text-5xl lg:text-6xl ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h2>

      {/* Description */}
      {desc ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-8 md:text-lg ${
            center ? "mx-auto" : ""
          } ${dark ? "text-white/60" : "text-black/58"}`}
        >
          {desc}
        </p>
      ) : null}

      {/* Small underline accent */}
      <div
        className={`mt-7 h-1 w-20 rounded-full bg-gradient-to-r from-qorliqGold to-transparent ${
          center ? "mx-auto" : ""
        }`}
      />
    </div>
  );
}