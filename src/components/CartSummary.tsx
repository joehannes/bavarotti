import { useMemo, useState } from 'react';
import type { OrderItem, Translations } from '../services/types';

const buildWhatsAppMessage = (
  restaurantName: string,
  orderItems: OrderItem[],
  translations: Translations,
  languageLabel: string,
  context: {
    customerName: string;
    deliveryZone: string;
    deliveryAddress: string;
    desiredTime: string;
    note: string;
  },
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

  message.push(
    '',
    replacePlaceholder(translations['whatsapp.customer'] ?? 'Customer: {value}', context.customerName || '-'),
    replacePlaceholder(translations['whatsapp.zone'] ?? 'Zone: {value}', context.deliveryZone || '-'),
    replacePlaceholder(translations['whatsapp.address'] ?? 'Address / Spot: {value}', context.deliveryAddress || '-'),
    replacePlaceholder(translations['whatsapp.time'] ?? 'Desired time: {value}', context.desiredTime || '-'),
  );

  if (context.note) {
    message.push(replacePlaceholder(translations['whatsapp.note'] ?? 'Note: {value}', context.note));
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
  const [customerName, setCustomerName] = useState('');
  const [deliveryZone, setDeliveryZone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [desiredTime, setDesiredTime] = useState('');
  const [note, setNote] = useState('');

  const totalItems = orderItems.reduce((acc, order) => acc + order.quantity, 0);
  const total = orderItems.reduce((sum, order) => sum + order.quantity * order.item.price, 0);
  const currency = orderItems[0]?.item.currency ?? '';
  const deliveryOptions = useMemo(
    () =>
      (translations['delivery.zones'] ?? 'Los Corales|Cortecito|Bavaro Beachfront|Nearby Hotels')
        .split('|')
        .map((value) => value.trim())
        .filter(Boolean),
    [translations],
  );
  const message = buildWhatsAppMessage(restaurantName, orderItems, translations, languageLabel, {
    customerName,
    deliveryZone,
    deliveryAddress,
    desiredTime,
    note,
  });
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
      <div className="cart__workflow">
        <input
          type="text"
          placeholder={translations['cart.namePlaceholder'] ?? 'Your name'}
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <select value={deliveryZone} onChange={(event) => setDeliveryZone(event.target.value)}>
          <option value="">{translations['cart.zonePlaceholder'] ?? 'Delivery zone'}</option>
          {deliveryOptions.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder={translations['cart.addressPlaceholder'] ?? 'Beach spot / hotel / villa'}
          value={deliveryAddress}
          onChange={(event) => setDeliveryAddress(event.target.value)}
        />
        <input
          type="text"
          placeholder={translations['cart.timePlaceholder'] ?? 'Desired delivery time (e.g. 8:30 PM)'}
          value={desiredTime}
          onChange={(event) => setDesiredTime(event.target.value)}
        />
        <textarea
          placeholder={translations['cart.notePlaceholder'] ?? 'Allergies, no-spice, extra ice, etc.'}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
        />
      </div>
      <a
        className={`btn btn--wa ${orderItems.length === 0 ? 'btn--disabled' : ''}`}
        href={orderItems.length === 0 ? '#' : whatsappUrl}
        aria-disabled={orderItems.length === 0}
        target="_blank"
        rel="noreferrer"
      >
        {translations['cta.order'] ?? 'Order via WhatsApp'}
      </a>
      <a className="btn btn--ghost" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
        {translations['cta.questions'] ?? 'General questions on WhatsApp'}
      </a>
      <p className="cart__note">{translations['cart.note'] ?? 'We will confirm your order via WhatsApp.'}</p>
    </aside>
  );
};

export default CartSummary;
