import { App } from 'aws-cdk-lib';
import { WorldCupStack } from './cdk-stack';
import { getEnvVar } from './env';

export function deploy() {
  const app = new App();

  new WorldCupStack(app, 'WorldCupStack', {
    env: {
      account: getEnvVar('AWS_ACCOUNT_ID'),
      region: 'eu-north-1',
    },
  });
}
