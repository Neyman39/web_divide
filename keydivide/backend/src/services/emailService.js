const nodemailer = require('nodemailer');

const { formatPriceRub } = require('../utils/authHelpers');

// Создаём транспортер один раз при старте
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT) || 1025,
  secure: false, // true для 465, false для других портов
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined,
});

// Проверка подключения (опционально)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server ready to send messages');
  }
});

/**
 * Отправка письма с подтверждением заказа
 */
async function sendOrderConfirmation({ user, order, items, shopInfo = {} }) {
  const {
    email = 'test@example.com',
    name = 'Покупатель',
    login = 'user'
  } = user || {};

  const orderDate = new Date(order.created_at).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const itemsList = items.map(item => 
    `• ${item.product_name}${item.switch_name ? ` (${item.switch_name})` : ''} — ${item.quantity} шт. × ${formatPriceRub(item.unit_price)} = ${formatPriceRub(item.quantity * item.unit_price)}`
  ).join('\n');

  const mailOptions = {
    from: `"${shopInfo.name || 'MyShop'}" <${process.env.EMAIL_FROM || 'noreply@myshop.local'}>`,
    to: email,
    cc: process.env.EMAIL_TO_ADMIN, // копия админу (опционально)
    subject: `✅ Заказ #${order.id} подтверждён — ${shopInfo.name || 'MyShop'}`,
    text: `
Здравствуйте, ${name}!

Ваш заказ #${order.id} успешно оформлен.

📅 Дата: ${orderDate}
🛍 Магазин: ${shopInfo.name || 'MyShop'}
📍 Адрес: ${shopInfo.address || 'ул. Примерная, 1'}

📦 Состав заказа:
${itemsList}

💰 Итого: ${formatPriceRub(order.total)} ₽
📊 Статус: ${order.status}

Спасибо за покупку! 🎉

---
Это автоматическое письмо, пожалуйста, не отвечайте на него.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .order-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .item:last-child { border-bottom: none; }
    .total { font-weight: bold; font-size: 1.2em; color: #4f46e5; margin-top: 15px; }
    .footer { font-size: 0.9em; color: #666; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h2>✅ Заказ подтверждён</h2>
    <p>Спасибо за покупку, ${name}!</p>
  </div>
  <div class="content">
    <div class="order-info">
      <p><strong>📋 Номер заказа:</strong> #${order.id}</p>
      <p><strong>📅 Дата:</strong> ${orderDate}</p>
      <p><strong>🛍 Магазин:</strong> ${shopInfo.name || 'MyShop'}</p>
      ${shopInfo.address ? `<p><strong>📍 Адрес:</strong> ${shopInfo.address}</p>` : ''}
    </div>

    <h3>📦 Состав заказа:</h3>
    ${items.map(item => `
      <div class="item">
        <strong>${item.product_name}</strong>${item.switch_name ? `<br><small>Переключатель: ${item.switch_name}</small>` : ''}
        <br>${item.quantity} шт. × ${formatPriceRub(item.unit_price)}
        = <strong>${formatPriceRub(item.quantity * item.unit_price)}</strong>
      </div>
    `).join('')}

    <div class="total">💰 Итого: ${formatPriceRub(order.total)} </div>
    <p><strong>📊 Статус:</strong> <span style="color: #059669;">${order.status}</span></p>

    <div class="footer">
      <p>Это автоматическое письмо, пожалуйста, не отвечайте на него.</p>
      <p>© ${new Date().getFullYear()} ${shopInfo.name || 'MyShop'}. Все права защищены.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📧 Email sent:', info.messageId);
  return info;
}

module.exports = { sendOrderConfirmation };