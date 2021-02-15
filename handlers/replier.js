'use strict';

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' })


module.exports.handler = async event => {
  const sns = new AWS.SNS({ apiVersion: '2010-03-31' })
  const sqs = new AWS.SQS({ apiVersion: '2012-11-05' })

  const { Records } = event
  const { TOPIC_REPLY_ARN, QUEUE_REQUEST_ADDITION_URL } = process.env

  for (const { body, receiptHandle } of Records) {
    const { uuid, sum } = JSON.parse(body)
    const result = sum.reduce((a, b) => a + b, 0)

    console.log('uuid', uuid)
    console.log('result', result)

    const deduplicationId = `${uuid}-${Math.floor(new Date().getTime() / 1000.0)}`
    const messageBody = JSON.stringify({
      uuid,
      result
    })

    try {
      const snsParams = {
        Message: messageBody,
        TopicArn: TOPIC_REPLY_ARN,
        MessageDeduplicationId: deduplicationId,
        MessageGroupId: 'Replier',
        MessageAttributes: {
          event: {
            DataType: 'String',
            StringValue: 'replyAddition'
          }
        }
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
