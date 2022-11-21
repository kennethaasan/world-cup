import * as cdk from '@aws-cdk/core';
import { Stack } from './cdk-stack';
import { getEnvVar } from './env';

export function deploy() {
  const app = new cdk.App();

  new Stack(app, 'WorldCupStack', {
    env: {
      account: getEnvVar('AWS_ACCOUNT_ID'),
      region: 'us-east-1',
    },
  });
}
