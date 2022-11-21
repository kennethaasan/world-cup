import { App } from 'aws-cdk-lib';
import { WorldCupStack } from './cdk-stack';
import { getEnvVar } from './env';

console.log('AWS_ACCOUNT_ID', getEnvVar('AWS_ACCOUNT_ID'));
console.log('AWS_DEFAULT_REGION', getEnvVar('AWS_DEFAULT_REGION'));
console.log('AWS_ACCESS_KEY_ID', getEnvVar('AWS_ACCESS_KEY_ID'));
console.log('AWS_SECRET_ACCESS_KEY', getEnvVar('AWS_SECRET_ACCESS_KEY'));

export function deploy() {
  const app = new App();

  new WorldCupStack(app, 'WorldCupStack', {
    env: {
      account: getEnvVar('AWS_ACCOUNT_ID'),
      region: getEnvVar('AWS_DEFAULT_REGION'),
    },
  });
}
