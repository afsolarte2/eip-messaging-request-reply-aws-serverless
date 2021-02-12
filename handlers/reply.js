'use strict';

const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' })

module.exports.handler = async event => {
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

  const { Records } = event
  const { QUEUE_REPLY_ADDITION_URL } = process.env

  for (const { body, receiptHandle } of Records) {
    console.log('result', body)

    try {
      const sqsParams = {
        QueueUrl: QUEUE_REPLY_ADDITION_URL,
        ReceiptHandle: receiptHandle
      }

      const deleteSqsMessagePromise = await sqs.deleteMessage(sqsParams).promise()

      console.log(deleteSqsMessagePromise)
    } catch (error) {
      console.error(error, error.stack);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};
