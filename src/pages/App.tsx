import { useState } from 'react';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import SpecialsSection from '../components/SpecialsSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import CartSummary from '../components/CartSummary';
import AdminPanel from '../components/AdminPanel';
import { useJsonFetch } from '../hooks/useJsonFetch';
import type { Category, MenuItem, OrderItem, Special, Translations } from '../services/types';
import { getStoredLanguage, setStoredLanguage, type Language } from '../services/i18n';

const restaurantName = import.meta.env.VITE_RESTAURANT_NAME ?? 'Bavarotti';
const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? '';
const adminOtp = import.meta.env.VITE_ADMIN_OTP ?? '';
const jsonBinApiKey = import.meta.env.VITE_JSONBIN_API_KEY ?? '';

const jsonUrls = {
  menu: import.meta.env.VITE_JSONBIN_MENU_URL,
  categories: import.meta.env.VITE_JSONBIN_CATEGORIES_URL,
  specials: import.meta.env.VITE_JSONBIN_SPECIALS_URL,
  translationsEn: import.meta.env.VITE_JSONBIN_TRANSLATIONS_EN_URL,
  translationsEs: import.meta.env.VITE_JSONBIN_TRANSLATIONS_ES_URL,
};

const App = () => {
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

  const translationsUrl =
    language === 'en' ? jsonUrls.translationsEn : jsonUrls.translationsEs;

  const menuState = useJsonFetch<MenuItem[]>(jsonUrls.menu);
  const categoriesState = useJsonFetch<Category[]>(jsonUrls.categories);
  const specialsState = useJsonFetch<Special[]>(jsonUrls.specials);
  const translationsState = useJsonFetch<Translations>(translationsUrl);

  const translations = translationsState.data ?? {};

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
  };

  const handleAddToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((order) => order.item.id === item.id);
      if (existing) {
        return prev.map((order) =>
          order.item.id === item.id
            ? { ...order, quantity: order.quantity + 1 }
            : order,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleOrderClick = () => {
    const element = document.getElementById('order');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const loading =
    menuState.loading ||
    categoriesState.loading ||
    specialsState.loading ||
    translationsState.loading;

  const hasError =
    menuState.error ||
    categoriesState.error ||
    specialsState.error ||
    translationsState.error;

  if (loading && !translationsState.data) {
    return <div className="loading" aria-busy="true" />;
  }

  if (hasError && !translationsState.data) {
    return <div className="error" role="alert" />;
  }

  return (
    <div className="app">
      <Hero translations={translations} onOrderClick={handleOrderClick} />
      <div className="content">
        <MenuSection
          translations={translations}
          categories={categoriesState.data ?? []}
          items={menuState.data ?? []}
          onAdd={handleAddToOrder}
          orderItems={orderItems}
        />
        <SpecialsSection translations={translations} specials={specialsState.data ?? []} />
        <AboutSection translations={translations} />
      </div>
      <section className="section section--cart" id="order">
        <div className="cart-wrapper">
          <CartSummary
            translations={translations}
            orderItems={orderItems}
            restaurantName={restaurantName}
            whatsappNumber={whatsappNumber}
            languageLabel={translations[`language.${language}`] ?? language}
          />
          <div className="cart__helper">
            <h3>{translations['cart.helpTitle']}</h3>
            <p>{translations['cart.helpText']}</p>
          </div>
        </div>
      </section>
      <Footer
        translations={translations}
        language={language}
        onLanguageChange={handleLanguageChange}
        onAdminToggle={() => setShowAdmin(true)}
      />
      {showAdmin ? (
        <AdminPanel
          translations={translations}
          otp={adminOtp}
          apiKey={jsonBinApiKey}
          resourceUrls={{
            menu: jsonUrls.menu,
            categories: jsonUrls.categories,
            specials: jsonUrls.specials,
            translationsEn: jsonUrls.translationsEn,
            translationsEs: jsonUrls.translationsEs,
          }}
          onClose={() => setShowAdmin(false)}
        />
      ) : null}
    </div>
  );
};

export default App;
