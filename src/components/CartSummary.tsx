import type { OrderItem, Translations } from '../services/types';

const safeText = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;

const fillTemplate = (template: unknown, value: string, fallback: string): string =>
  safeText(template, fallback).replace('{value}', value);

const buildWhatsAppMessage = (
  restaurantName: string,
  orderItems: OrderItem[],
  translations: Translations,
  languageLabel: string,
  note?: string,
) => {
  const lines = orderItems.map((order) => {
    const translatedName = safeText(translations[order.item.nameKey], order.item.nameKey);
    return `- ${order.quantity}x ${translatedName}`;
  });

  const message = [
    safeText(translations['whatsapp.greeting'], 'Hello 👋'),
    fillTemplate(
      translations['whatsapp.intro'],
      restaurantName,
      'I would like to order from {value}:',
    ),
    '',
    ...lines,
    '',
    fillTemplate(translations['whatsapp.language'], languageLabel, 'Language: {value}'),
  ];

  if (note) {
    message.push('', fillTemplate(translations['whatsapp.note'], note, 'Note: {value}'));
  }

  return message.join('\n');
};

type CartSummaryProps = {
  translations?: Translations;
  orderItems: OrderItem[];
  restaurantName: string;
  whatsappNumber: string;
  languageLabel: string;
};

const CartSummary = ({
  translations = {},
  orderItems,
  restaurantName,
  whatsappNumber,
  languageLabel,
}: CartSummaryProps) => {
  const totalItems = orderItems.reduce((acc, order) => acc + order.quantity, 0);
  const message = buildWhatsAppMessage(
    restaurantName,
    orderItems,
    translations,
    languageLabel,
  );
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  const itemsTemplate = safeText(translations['cart.items'], '{count} items');
  const itemsLabel = itemsTemplate.replace('{count}', String(totalItems));
  const cartTitle = safeText(translations['cart.title'], 'Your order');
  const cartEmpty = safeText(translations['cart.empty'], 'Add items to your order.');
  const cartNote = safeText(translations['cart.note'], '');
  const taxNote = safeText(translations['cart.taxNote'], '');
  const orderLabel = safeText(translations['cta.order'], 'Order via WhatsApp');

  return (
    <aside className="cart">
      <div className="cart__header">
        <h3>{cartTitle}</h3>
        <span>{itemsLabel}</span>
      </div>
      {orderItems.length === 0 ? (
        <p className="cart__empty">{cartEmpty}</p>
      ) : (
        <ul className="cart__list">
          {orderItems.map((order) => (
            <li key={order.item.id}>
              <span>{safeText(translations[order.item.nameKey], order.item.nameKey)}</span>
              <span>{order.quantity}x</span>
            </li>
          ))}
        </ul>
      )}
      <a
        className={`btn btn--primary ${orderItems.length === 0 ? 'btn--disabled' : ''}`}
        href={orderItems.length === 0 ? '#' : whatsappUrl}
        aria-disabled={orderItems.length === 0}
      >
        {orderLabel}
      </a>
      {cartNote ? <p className="cart__note">{cartNote}</p> : null}
      {taxNote ? <p className="cart__note">{taxNote}</p> : null}
    </aside>
  );
};

export default CartSummary;
