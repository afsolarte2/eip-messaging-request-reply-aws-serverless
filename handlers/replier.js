'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});


module.exports.handler = async event => {
  const { Records } = event
  const sns = new AWS.SNS()
  const { TOPIC_REPLY_ADDITION_ARN } = process.env

  console.log(Records)

  for (const record of Records) {
    console.log(record)
    console.log(record.body)
    console.log(JSON.parse(record.body))

    const arrayOfNums = JSON.parse(record.body)

    const result = arrayOfNums.reduce((a, b) => a + b, 0)

    console.log(result)

    const params = {
      Message: `${result}`,
      TopicArn: TOPIC_REPLY_ADDITION_ARN,
      MessageDeduplicationId: `${uuidv4()}-${Date.now()}`,
      MessageGroupId: 'myReplierGroup'
    };

    try {
      const publishTextPromise = await sns.publish(params).promise();

      console.log(publishTextPromise)
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
