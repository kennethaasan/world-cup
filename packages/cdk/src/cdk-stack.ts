import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager';
import { Cors, LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import path from 'path';
import { getEnvVar } from './env';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { ApiGateway, CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import {
  CloudFrontWebDistribution,
  SecurityPolicyProtocol,
  SSLMethod,
  ViewerCertificate,
} from 'aws-cdk-lib/aws-cloudfront';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';

const DOMAIN_HOSTED_ZONE = getEnvVar('DOMAIN_HOSTED_ZONE');
const DOMAIN_GRAPHQL_SERVER = getEnvVar('DOMAIN_GRAPHQL_SERVER');

const GOOGLE_API_KEY = getEnvVar('GOOGLE_API_KEY');

export class WorldCupStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const graphQLServerFunction = new Function(
      this,
      'graphql-server-function',
      {
        code: Code.fromAsset(path.join(__dirname, '../../backend')),
        handler: 'build/index.handler',
        runtime: Runtime.NODEJS_18_X,
        timeout: Duration.seconds(30),
        memorySize: 1024,
        environment: {
          NODE_ENV: 'production',
          GOOGLE_API_KEY,
        },
      }
    );

    const hostedZone = HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: DOMAIN_HOSTED_ZONE,
      privateZone: false,
    });

    const certificate = new Certificate(this, 'certificate', {
      domainName: DOMAIN_HOSTED_ZONE,
      subjectAlternativeNames: [`*.${DOMAIN_HOSTED_ZONE}`],
      validation: CertificateValidation.fromDns(hostedZone),
    });

    const graphQLServerApi = new LambdaRestApi(this, 'graphql-server-api', {
      handler: graphQLServerFunction,
      domainName: {
        domainName: DOMAIN_GRAPHQL_SERVER,
        certificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: [`https://${DOMAIN_HOSTED_ZONE}`],
        allowCredentials: true,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    new ARecord(this, 'graphql-server-alias-record', {
      zone: hostedZone,
      recordName: DOMAIN_GRAPHQL_SERVER,
      target: RecordTarget.fromAlias(new ApiGateway(graphQLServerApi)),
    });

    const frontendBucket = new Bucket(this, 'frontend-bucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const frontendDistribution = new CloudFrontWebDistribution(
      this,
      'frontend-distribution',
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: frontendBucket,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
        viewerCertificate: ViewerCertificate.fromAcmCertificate(certificate, {
          aliases: [DOMAIN_HOSTED_ZONE],
          securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2021,
          sslMethod: SSLMethod.SNI,
        }),
      }
    );

    new ARecord(this, 'frontend-alias-record', {
      recordName: DOMAIN_HOSTED_ZONE,
      zone: hostedZone,
      target: RecordTarget.fromAlias(
        new CloudFrontTarget(frontendDistribution)
      ),
    });

    new BucketDeployment(this, 'deploy-with-invalidation', {
      sources: [Source.asset(path.join(__dirname, '../../frontend/build'))],
      destinationBucket: frontendBucket,
      distribution: frontendDistribution,
      distributionPaths: ['/*'],
    });
  }
}
