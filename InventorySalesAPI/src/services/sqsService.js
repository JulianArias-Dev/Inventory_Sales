const { getSqsClient, getQueueUrl, SendMessageCommand } = require('../config/aws');

/**
 * Sends sale notification to AWS SQS.
 * Bug 4 Fixes:
 * 1. Product names are properly extracted and passed to notification details (Detalle: [...names]),
 *    preventing the previous NullReferenceException in .NET.
 * 2. Wrapped in non-blocking try/catch so missing AWS credentials or local network offline
 *    does NOT prevent or fail sale creation.
 */
async function sendSaleNotification(sale, productNames = []) {
  try {
    const queueUrl = getQueueUrl();
    if (!queueUrl) {
      console.warn('SQS Queue URL not configured; skipping notification.');
      return;
    }

    const email = (sale?.customerEmail && typeof sale.customerEmail === 'string' && sale.customerEmail.trim())
      ? sale.customerEmail.trim()
      : 'davidariass0519@gmail.com';

    const payload = {
      IdVenta: sale.id,
      Cliente: sale.customerName,
      Monto: sale.totalAmount,
      Email: email,
      Detalle: Array.isArray(productNames) ? productNames : []
    };

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(payload)
    });

    const client = getSqsClient();
    await client.send(command);
    console.log(`[SQS] Notification sent successfully for sale #${sale.id}`);
  } catch (error) {
    // Non-blocking: log warning only
    console.warn(`[SQS Warning] Could not send sale notification for sale #${sale?.id}: ${error.message}`);
  }
}

module.exports = { sendSaleNotification };
