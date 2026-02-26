import type { Translations } from '../services/types';
import SectionHeading from './SectionHeading';

type AboutSectionProps = {
  translations: Translations;
};

const AboutSection = ({ translations }: AboutSectionProps) => (
  <section className="section" id="about">
    <SectionHeading title={translations['about.title']} />
    <div className="about">
      <div>
        <p>{translations['about.story']}</p>
        <p>{translations['about.story2']}</p>
      </div>
      <ul className="about__highlights">
        <li>{translations['about.highlight1']}</li>
        <li>{translations['about.highlight2']}</li>
        <li>{translations['about.highlight3']}</li>
      </ul>
    </div>
  </section>
);

export default AboutSection;
