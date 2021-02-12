'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'us-east-1' })


module.exports.handler = async event => {
  const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

  const { Records } = event
  const { TOPIC_REPLY_ADDITION_ARN, QUEUE_REQUEST_ADDITION_URL } = process.env

  for (const { body, receiptHandle } of Records) {
    const arrayOfNums = JSON.parse(body)
    const result = arrayOfNums.reduce((a, b) => a + b, 0)

    console.log('result', result)

    try {
      const snsParams = {
        Message: `${result}`,
        TopicArn: TOPIC_REPLY_ADDITION_ARN,
        MessageDeduplicationId: `${uuidv4()}-${Date.now()}`,
        MessageGroupId: 'myReplierGroup'
      };

      const publishTextPromise = await sns.publish(snsParams).promise()

      console.log(publishTextPromise)
    } catch (error) {
      console.error(error, error.stack);
    }

    try {
      const sqsParams = {
        QueueUrl: QUEUE_REQUEST_ADDITION_URL,
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
