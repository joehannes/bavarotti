import type { Translations } from '../services/types';

type HeroProps = {
  translations: Translations;
  onOrderClick: () => void;
};

const Hero = ({ translations, onOrderClick }: HeroProps) => (
  <section className="hero" id="top">
    <div className="hero__overlay" />
    <div className="hero__content">
      <span className="pill">{translations['hero.pill']}</span>
      <h1>{translations['hero.title']}</h1>
      <p>{translations['hero.subtitle']}</p>
      <div className="hero__actions">
        <button className="btn btn--primary" onClick={onOrderClick}>
          {translations['cta.order'] ?? 'Order via WhatsApp'}
        </button>
        <span className="hero__note">{translations['hero.note']}</span>
      </div>
    </div>
  </section>
);

export default Hero;
