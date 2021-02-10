'use strict';

const AWS = require('aws-sdk');

AWS.config.update({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});

module.exports.handler = async event => {
  const sns = new AWS.SNS()
  const uuid = "abc-123"
  const { TOPIC_REQUEST_ADDITION_ARN } = process.env

  for (let index = 0; index < 10; index++) {

    const params = {
      Message: '[1,2,3,4]',
      TopicArn: TOPIC_REQUEST_ADDITION_ARN,
      MessageDeduplicationId: `${uuid}-${Date.now() / 1000}`,
      MessageGroupId: 'myRequestGroup'
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
