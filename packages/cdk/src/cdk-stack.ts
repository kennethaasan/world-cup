import * as apigateway from '@aws-cdk/aws-apigateway';
import * as certmgr from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import * as route53 from '@aws-cdk/aws-route53';
import * as route53Targets from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import path from 'path';
import { getEnvVar } from './env';

const DOMAIN_HOSTED_ZONE = getEnvVar('DOMAIN_HOSTED_ZONE');
const DOMAIN_GRAPHQL_SERVER = getEnvVar('DOMAIN_GRAPHQL_SERVER');

const GOOGLE_API_KEY = getEnvVar('GOOGLE_API_KEY');

export class Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const natGatewayProvider = ec2.NatProvider.instance({
      instanceType: new ec2.InstanceType('t3.micro'),
    });

    const vpc = new ec2.Vpc(this, 'vpc', {
      maxAzs: 1,
      natGateways: 1,
      natGatewayProvider,
    });

    const graphQLServerFunction = new lambda.Function(
      this,
      'graphql-server-function',
      {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'build/index.handler',
        timeout: cdk.Duration.seconds(30),
        vpc,
        memorySize: 1024,
        environment: {
          NODE_ENV: 'production',
          GOOGLE_API_KEY,
        },
      }
    );

    const hostedZone = route53.HostedZone.fromLookup(this, 'hosted-zone', {
      domainName: DOMAIN_HOSTED_ZONE,
      privateZone: false,
    });

    const certificate = new certmgr.DnsValidatedCertificate(
      this,
      'certificate',
      {
        domainName: DOMAIN_HOSTED_ZONE,
        subjectAlternativeNames: [`*.${DOMAIN_HOSTED_ZONE}`],
        hostedZone,
      }
    );

    const graphQLServerApi = new apigateway.LambdaRestApi(
      this,
      'graphql-server-api',
      {
        handler: graphQLServerFunction,
        domainName: {
          domainName: DOMAIN_GRAPHQL_SERVER,
          certificate,
        },
        defaultCorsPreflightOptions: {
          allowOrigins: [`https://${DOMAIN_HOSTED_ZONE}`],
          allowCredentials: true,
          allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
          allowMethods: apigateway.Cors.ALL_METHODS,
        },
      }
    );

    new route53.ARecord(this, 'graphql-server-alias-record', {
      zone: hostedZone,
      recordName: DOMAIN_GRAPHQL_SERVER,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(graphQLServerApi)
      ),
    });

    const frontendBucket = new s3.Bucket(this, 'frontend-bucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const frontendDistribution = new cloudfront.CloudFrontWebDistribution(
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
        viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
          certificate,
          {
            aliases: [DOMAIN_HOSTED_ZONE],
            securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
            sslMethod: cloudfront.SSLMethod.SNI,
          }
        ),
      }
    );

    new route53.ARecord(this, 'frontend-alias-record', {
      recordName: DOMAIN_HOSTED_ZONE,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(frontendDistribution)
      ),
    });

    new s3Deployment.BucketDeployment(this, 'deploy-with-invalidation', {
      sources: [
        s3Deployment.Source.asset(path.join(__dirname, '../../frontend/build')),
      ],
      destinationBucket: frontendBucket,
      distribution: frontendDistribution,
      distributionPaths: ['/*'],
    });
  }
}
