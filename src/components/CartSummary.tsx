import type { OrderItem, Translations } from '../services/types';

const buildWhatsAppMessage = (
  restaurantName: string,
  orderItems: OrderItem[],
  translations: Translations,
  languageLabel: string,
  note?: string,
) => {
  const replacePlaceholder = (template: string | undefined, value: string) =>
    (template ?? '{value}').replace('{value}', value);
  const lines = orderItems.map((order) => {
    const translatedName = translations[order.item.nameKey] ?? order.item.nameKey;
    const lineTotal = order.quantity * order.item.price;
    return `- ${order.quantity}x ${translatedName} (${order.item.currency} ${lineTotal.toFixed(2)})`;
  });

  const total = orderItems.reduce((sum, order) => sum + order.quantity * order.item.price, 0);
  const currency = orderItems[0]?.item.currency ?? '';

  const message = [
    translations['whatsapp.greeting'] ?? 'Hello 👋',
    replacePlaceholder(
      translations['whatsapp.intro'] ?? 'I would like to order from {value}:',
      restaurantName,
    ),
    '',
    ...lines,
    '',
    `${translations['cart.total'] ?? 'Total'}: ${currency} ${total.toFixed(2)}`,
    replacePlaceholder(
      translations['whatsapp.language'] ?? 'Language: {value}',
      languageLabel,
    ),
  ];

  if (note) {
    message.push('', replacePlaceholder(translations['whatsapp.note'] ?? 'Note: {value}', note));
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
  const total = orderItems.reduce((sum, order) => sum + order.quantity * order.item.price, 0);
  const currency = orderItems[0]?.item.currency ?? '';
  const message = buildWhatsAppMessage(restaurantName, orderItems, translations, languageLabel);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  return (
    <aside className="cart">
      <div className="cart__header">
        <h3>{translations['cart.title']}</h3>
        <span>{(translations['cart.items'] ?? '{count} items').replace('{count}', String(totalItems))}</span>
      </div>
      {orderItems.length === 0 ? (
        <p className="cart__empty">{translations['cart.empty']}</p>
      ) : (
        <ul className="cart__list">
          {orderItems.map((order) => {
            const lineTotal = order.item.price * order.quantity;
            return (
              <li key={order.item.id}>
                <div>
                  <span>{translations[order.item.nameKey] ?? order.item.nameKey}</span>
                  <small>{order.quantity}x</small>
                </div>
                <span>
                  {order.item.currency} {lineTotal.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="cart__total">
        <strong>{translations['cart.total'] ?? 'Total'}</strong>
        <strong>
          {currency} {total.toFixed(2)}
        </strong>
      </div>
      <a
        className={`btn btn--primary ${orderItems.length === 0 ? 'btn--disabled' : ''}`}
        href={orderItems.length === 0 ? '#' : whatsappUrl}
        aria-disabled={orderItems.length === 0}
      >
        {translations['cta.order'] ?? 'Order via WhatsApp'}
      </a>
      <p className="cart__note">{translations['cart.note'] ?? 'We will confirm your order via WhatsApp.'}</p>
    </aside>
  );
};

export default CartSummary;
