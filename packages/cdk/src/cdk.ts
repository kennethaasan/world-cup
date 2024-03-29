import { App } from 'aws-cdk-lib';
import { WorldCupStack } from './cdk-stack';
import { getEnvVar } from './env';

export function deploy() {
  const app = new App();

  new WorldCupStack(app, 'WorldCupStackProd', {
    env: {
      account: getEnvVar('AWS_ACCOUNT_ID'),
      region: getEnvVar('AWS_DEFAULT_REGION'),
    },
  });
}
