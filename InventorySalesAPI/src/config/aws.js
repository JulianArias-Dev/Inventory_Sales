let SQSClient;
let SendMessageCommand;

try {
  const sqs = require('@aws-sdk/client-sqs');
  SQSClient = sqs.SQSClient;
  SendMessageCommand = sqs.SendMessageCommand;
} catch (e) {
  SQSClient = class MockSQSClient {
    constructor(opts) {
      this.opts = opts;
    }
    async send(cmd) {
      return { MessageId: 'mock-msg-id' };
    }
  };
  SendMessageCommand = class MockSendMessageCommand {
    constructor(input) {
      this.input = input;
    }
  };
}

let sqsClient = null;

function getQueueUrl() {
  return process.env.AWS_SQS_QUEUE_URL ||
         process.env.AWS__SQS__ColaVentas ||
         'https://sqs.us-east-1.amazonaws.com/211125320918/email-queue';
}

function getRegion() {
  return process.env.AWS_REGION || process.env.AWS__Region || 'us-east-1';
}

function getSqsClient() {
  if (!sqsClient) {
    sqsClient = new SQSClient({ region: getRegion() });
  }
  return sqsClient;
}

function setSqsClient(client) {
  sqsClient = client;
}

module.exports = {
  getSqsClient,
  setSqsClient,
  getQueueUrl,
  getRegion,
  SQSClient,
  SendMessageCommand
};
