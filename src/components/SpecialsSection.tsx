import type { Special, Translations } from '../services/types';
import SectionHeading from './SectionHeading';

type SpecialsSectionProps = {
  translations: Translations;
  specials: Special[];
};

const SpecialsSection = ({ translations, specials }: SpecialsSectionProps) => {
  const safeSpecials = Array.isArray(specials) ? specials : [];

  return (
  <section className="section section--alt" id="specials">
    <SectionHeading
      title={translations['specials.title']}
      subtitle={translations['specials.subtitle']}
    />
    <div className="specials">
      {safeSpecials.map((special) => (
        <article key={special.id} className="special-card">
          {special.image ? (
            <img
              src={special.image.url}
              alt={translations[special.image.altKey] ?? special.image.altKey}
              loading="lazy"
            />
          ) : null}
          <div className="special-card__content">
            <h3>{translations[special.nameKey] ?? special.nameKey}</h3>
            <p>{translations[special.descriptionKey] ?? special.descriptionKey}</p>
            <span className={`pill ${special.available ? '' : 'pill--muted'}`}>
              {special.available
                ? translations['specials.available']
                : translations['specials.soldOut']}
            </span>
          </div>
        </article>
      ))}
    </div>
  </section>
  );
};

export default SpecialsSection;
