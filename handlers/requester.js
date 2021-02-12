'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
  apiVersion: '2010-03-31',
  region: 'us-east-1'
});

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min) + min);
}

module.exports.handler = async event => {
  const sns = new AWS.SNS()
  const uuid = uuidv4()
  const messagesToSend = getRandomInt(1, 40)

  const { TOPIC_REQUEST_ADDITION_ARN } = process.env

  for (let index = 0; index < messagesToSend; index++) {
    const deduplicationId = `${uuid}-${Math.floor(new Date().getTime() / 1000.0)}`

    const message = JSON.stringify({
      uuid,
      sum: [
        getRandomInt(1, 5),
        getRandomInt(6, 10),
        getRandomInt(11, 15)
      ]
    })

    const params = {
      Message: message,
      TopicArn: TOPIC_REQUEST_ADDITION_ARN,
      MessageDeduplicationId: deduplicationId,
      MessageGroupId: 'requestAddition'
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
