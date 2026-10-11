const { sendSaleNotification } = require('../src/services/sqsService');
const awsConfig = require('../src/config/aws');

describe('SQS Notification Service Unit Tests (Bug 4 fix)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      send: jest.fn().mockResolvedValue({ MessageId: 'msg-12345' })
    };
    awsConfig.setSqsClient(mockClient);
  });

  it('debe enviar la notificación a SQS con los nombres de productos en Detalle', async () => {
    const sale = {
      id: 50,
      customerName: 'Maria Lopez',
      customerEmail: 'maria@example.com',
      totalAmount: 345000
    };
    const productNames = ['Jeans Azules', 'Tennis Adidas'];

    await sendSaleNotification(sale, productNames);

    expect(mockClient.send).toHaveBeenCalledTimes(1);
    const command = mockClient.send.mock.calls[0][0];

    expect(command.input.QueueUrl).toBe(awsConfig.getQueueUrl());
    const payload = JSON.parse(command.input.MessageBody);

    expect(payload).toEqual({
      IdVenta: 50,
      Cliente: 'Maria Lopez',
      Monto: 345000,
      Email: 'maria@example.com',
      Detalle: ['Jeans Azules', 'Tennis Adidas'] // Must be array of product names
    });
  });

  it('debe manejar errores de AWS SQS de forma no bloqueante (no lanzar excepción)', async () => {
    mockClient.send.mockRejectedValue(new Error('UnrecognizedClientException: The security token included in the request is invalid.'));

    const sale = {
      id: 51,
      customerName: 'Juan Perez',
      customerEmail: 'juan@example.com',
      totalAmount: 100000
    };

    // Must resolve cleanly without throwing
    await expect(sendSaleNotification(sale, ['Jeans Claros'])).resolves.toBeUndefined();
  });

  it('debe asignar email por defecto si customerEmail es null o vacío', async () => {
    const sale = {
      id: 52,
      customerName: 'Anonimo',
      customerEmail: null,
      totalAmount: 50000
    };

    await sendSaleNotification(sale, ['Articulo X']);
    const command = mockClient.send.mock.calls[0][0];
    const payload = JSON.parse(command.input.MessageBody);
    expect(payload.Email).toBe('davidariass0519@gmail.com');
  });
});
