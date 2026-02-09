import type { OrderItem, Translations } from '../services/types';

const buildWhatsAppMessage = (
  restaurantName: string,
  orderItems: OrderItem[],
  translations: Translations,
  languageLabel: string,
  note?: string,
) => {
  const replacePlaceholder = (template: string, value: string) =>
    template.replace('{value}', value);
  const lines = orderItems.map((order) => {
    const translatedName = translations[order.item.nameKey] ?? order.item.nameKey;
    return `- ${order.quantity}x ${translatedName}`;
  });
  const message = [
    translations['whatsapp.greeting'] ?? 'Hello 👋',
    replacePlaceholder(
      translations['whatsapp.intro'] ?? 'I would like to order from {value}:',
      restaurantName,
    ),
    '',
    ...lines,
    '',
    replacePlaceholder(
      translations['whatsapp.language'] ?? 'Language: {value}',
      languageLabel,
    ),
  ];

  if (note) {
    message.push(
      '',
      replacePlaceholder(translations['whatsapp.note'] ?? 'Note: {value}', note),
    );
  }

  return message.join('\n');
};

type CartSummaryProps = {
  translations: Translations;
  orderItems: OrderItem[];
  restaurantName: string;
  whatsappNumber: string;
  languageLabel: string;
};

const CartSummary = ({
  translations,
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
  const encodedMessage = encodeURIComponent(
    message.replace(/\n\n/g, '\n\n'),
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <aside className="cart">
      <div className="cart__header">
        <h3>{translations['cart.title']}</h3>
        <span>{translations['cart.items'].replace('{count}', String(totalItems))}</span>
      </div>
      {orderItems.length === 0 ? (
        <p className="cart__empty">{translations['cart.empty']}</p>
      ) : (
        <ul className="cart__list">
          {orderItems.map((order) => (
            <li key={order.item.id}>
              <span>{translations[order.item.nameKey] ?? order.item.nameKey}</span>
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
        {translations['cta.order']}
      </a>
      <p className="cart__note">{translations['cart.note']}</p>
    </aside>
  );
};

export default CartSummary;
