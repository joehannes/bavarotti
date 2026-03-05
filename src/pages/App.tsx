import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import MenuSection from '../components/MenuSection';
import SpecialsSection from '../components/SpecialsSection';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import CartSummary from '../components/CartSummary';
import AdminPanel from '../components/AdminPanel';
import TopNav from '../components/TopNav';
import { useJsonFetch } from '../hooks/useJsonFetch';
import type { Category, MenuItem, OrderItem, Special, Translations } from '../services/types';
import { getStoredLanguage, setStoredLanguage, type Language } from '../services/i18n';

const env = import.meta.env;

const restaurantName = env.VITE_RESTAURANT_NAME ?? 'Bavarotti';
const whatsappNumber = env.VITE_WHATSAPP_NUMBER ?? '';
const adminOtp =
  env.WHITE_ADMIN_OTP ??
  env.white_admin_otp ??
  env.VITE_ADMIN_OTP ??
  '';

const jsonBinApiKey =
  env.WHITE_JSONBIN_KEY ??
  env.white_jsonbin_key ??
  env.VITE_JSONBIN_API_KEY ??
  '';

const cloudinary = {
  cloudName:
    env.WHITE_CLOUDINARY_CLOUD_NAME ??
    env.white_cloudinary_cloud_name ??
    env.VITE_CLOUDINARY_CLOUD_NAME ??
    '',
  apiKey:
    env.WHITE_CLOUDINARY_API_TOKEN ??
    env.white_cloudinary_api_token ??
    env.VITE_CLOUDINARY_API_KEY ??
    '',
  apiSecret:
    env.WHITE_CLOUDINARY_API_SECRET ??
    env.white_cloudinary_api_secret ??
    env.VITE_CLOUDINARY_API_SECRET ??
    '',
  folder: env.VITE_CLOUDINARY_FOLDER ?? 'bavarotti',
};

const cloudinary = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY ?? '',
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET ?? '',
  folder: import.meta.env.VITE_CLOUDINARY_FOLDER ?? 'bavarotti',
};

const jsonUrls = {
  menu: env.VITE_JSONBIN_MENU_URL,
  categories: env.VITE_JSONBIN_CATEGORIES_URL,
  specials: env.VITE_JSONBIN_SPECIALS_URL,
  translationsEn: env.VITE_JSONBIN_TRANSLATIONS_EN_URL,
  translationsEs: env.VITE_JSONBIN_TRANSLATIONS_ES_URL,
};

const App = () => {
  const [language, setLanguage] = useState<Language>(getStoredLanguage());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

  const translationsUrl = language === 'en' ? jsonUrls.translationsEn : jsonUrls.translationsEs;

  const menuState = useJsonFetch<MenuItem[]>(jsonUrls.menu);
  const categoriesState = useJsonFetch<Category[]>(jsonUrls.categories);
  const specialsState = useJsonFetch<Special[]>(jsonUrls.specials);
  const translationsState = useJsonFetch<Translations>(translationsUrl);

  const translations =
    translationsState.data && typeof translationsState.data === 'object' && !Array.isArray(translationsState.data)
      ? translationsState.data
      : {};
  const menuItems = Array.isArray(menuState.data) ? menuState.data : [];
  const categories = Array.isArray(categoriesState.data) ? categoriesState.data : [];
  const specials = Array.isArray(specialsState.data) ? specialsState.data : [];

  const handleLanguageChange = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
  };

  const handleAddToOrder = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((order) => order.item.id === item.id);
      if (existing) {
        return prev.map((order) =>
          order.item.id === item.id ? { ...order, quantity: order.quantity + 1 } : order,
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
    menuState.loading || categoriesState.loading || specialsState.loading || translationsState.loading;

  const hasError =
    menuState.error || categoriesState.error || specialsState.error || translationsState.error;

  if (loading && !translationsState.data) {
    return <div className="loading" aria-busy="true" />;
  }

  if (hasError && !translationsState.data) {
    return <div className="error" role="alert" />;
  }

  return (
    <div className="app">
      <TopNav
        translations={translations}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOrderClick={handleOrderClick}
        brandName={restaurantName}
      />
      <Hero translations={translations} onOrderClick={handleOrderClick} />
      <div className="content">
        <MenuSection
          translations={translations}
          categories={categories}
          items={menuItems}
          onAdd={handleAddToOrder}
          orderItems={orderItems}
        />
        <SpecialsSection translations={translations} specials={specials} />
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
            <h3>{translations['cart.helpTitle'] ?? 'Order details'}</h3>
            <p>{translations['cart.helpText'] ?? 'We will confirm your order on WhatsApp before preparing it.'}</p>
          </div>
        </div>
      </section>
      <Footer
        translations={translations}
        language={language}
        whatsappNumber={whatsappNumber}
        onLanguageChange={handleLanguageChange}
        onAdminToggle={() => setShowAdmin(true)}
      />
      {showAdmin ? (
        <AdminPanel
          translations={translations}
          otp={adminOtp}
          apiKey={jsonBinApiKey}
          cloudinary={cloudinary}
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
