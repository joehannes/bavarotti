import type { Translations } from '../services/types';

type HeroProps = {
  translations: Translations;
  onOrderClick: () => void;
};

const Hero = ({ translations, onOrderClick }: HeroProps) => (
  <section className="hero">
    <div className="hero__content">
      <span className="pill">{translations['hero.pill']}</span>
      <h1>{translations['hero.title']}</h1>
      <p>{translations['hero.subtitle']}</p>
      <div className="hero__actions">
        <button className="btn btn--primary" onClick={onOrderClick}>
          {translations['cta.order']}
        </button>
        <span className="hero__note">{translations['hero.note']}</span>
      </div>
    </div>
    <div className="hero__image" aria-hidden="true">
      <img
        src="https://res.cloudinary.com/demo/image/upload/c_fill,w_840,h_640,q_auto,f_auto/sea-turtle.jpg"
        alt=""
        loading="lazy"
      />
    </div>
  </section>
);

export default Hero;
