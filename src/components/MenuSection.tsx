import type { Category, MenuItem, OrderItem, Translations } from '../services/types';
import SectionHeading from './SectionHeading';

type MenuSectionProps = {
  translations: Translations;
  categories: Category[];
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
  orderItems: OrderItem[];
};

const MenuSection = ({ translations, categories, items, onAdd, orderItems }: MenuSectionProps) => (
  <section className="section" id="menu">
    <SectionHeading
      title={translations['menu.title']}
      subtitle={translations['menu.subtitle']}
    />
    <div className="menu">
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.categoryId === category.id);
        return (
          <div className="menu__category" key={category.id}>
            <div className="menu__category-header">
              <h3>{translations[category.labelKey] ?? category.labelKey}</h3>
              {category.descriptionKey ? (
                <p>{translations[category.descriptionKey] ?? category.descriptionKey}</p>
              ) : null}
            </div>
            <div className="menu__items">
              {categoryItems.map((item) => {
                const activeOrder = orderItems.find((order) => order.item.id === item.id);
                return (
                  <article
                    key={item.id}
                    className={`menu-card ${item.available ? '' : 'menu-card--disabled'}`}
                  >
                    <img
                      src={item.image.url}
                      alt={translations[item.image.altKey] ?? item.image.altKey}
                      loading="lazy"
                    />
                    <div className="menu-card__content">
                      <div className="menu-card__header">
                        <h4>{translations[item.nameKey] ?? item.nameKey}</h4>
                        <span>
                          {item.currency} {item.price.toFixed(2)}
                        </span>
                      </div>
                      <p>{translations[item.descriptionKey] ?? item.descriptionKey}</p>
                      <div className="menu-card__footer">
                        <button
                          className="btn btn--ghost"
                          onClick={() => onAdd(item)}
                          disabled={!item.available}
                        >
                          {item.available
                            ? translations['menu.add']
                            : translations['menu.unavailable']}
                        </button>
                        {activeOrder ? (
                          <span className="menu-card__qty">
                            {translations['menu.inCart']} {activeOrder.quantity}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default MenuSection;
