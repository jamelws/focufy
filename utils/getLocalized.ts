// Tipos base
interface Question {
  title?: string;
  titleEn?: string;
  titleFr?: string;
}

interface Option {
  label?: string;
  labelEn?: string;
  labelFr?: string;
}

/**
 * Retorna el título traducido de una pregunta según idioma.
 * Fallback → español.
 */
export function getLocalizedField(q: Question | null | undefined, lang: string): string {
  if (!q) return "";
  switch (lang) {
    case "en":
      return q.titleEn || q.title || "";
    case "fr":
      return q.titleFr || q.title || "";
    default:
      return q.title || "";
  }
}

/**
 * Retorna la etiqueta traducida de una opción según idioma.
 * Fallback → español.
 */
export function getLocalizedOption(opt: Option | null | undefined, lang: string): string {
  if (!opt) return "";
  switch (lang) {
    case "en":
      return opt.labelEn || opt.label || "";
    case "fr":
      return opt.labelFr || opt.label || "";
    default:
      return opt.label || "";
  }
}
