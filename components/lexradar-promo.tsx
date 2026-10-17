import LexradarLink from "./lexradar-link";

export default function LexradarPromo() {
  return (
    <section
      aria-labelledby="lexradar-promo"
      className="mx-auto max-w-[1400px] px-6 py-14 md:px-12 md:py-20"
    >
      <div className="rounded-2xl border border-gold/20 bg-white/[0.025] p-7 md:flex md:items-center md:justify-between md:gap-12 md:p-12">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs tracking-[0.25em] text-gold">
            LEXRADAR / ЮРИДИЧЕСКИЙ АУДИТ
          </p>
          <h2
            id="lexradar-promo"
            className="text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Ваш сайт защищён от юридических штрафов?
          </h2>
          <p className="mt-5 leading-relaxed text-white/65">
            Проверьте, нет ли ошибок в документах, согласиях и обработке
            персональных данных.
          </p>
        </div>
        <LexradarLink className="mt-7 inline-flex min-h-14 shrink-0 items-center justify-center rounded-full bg-gold px-7 text-sm font-semibold text-black transition-colors hover:bg-[#e4c55e] md:mt-0">
          Бесплатный аудит сайта ↗
        </LexradarLink>
      </div>
    </section>
  );
}
