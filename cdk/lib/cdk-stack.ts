import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

export class CdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const cloudfrontOAI = new cloudfront.OriginAccessIdentity(
			this,
			"CloudFrontOAI",
			{}
		);

		const siteBucket = new s3.Bucket(this, "SiteBucket", {
			bucketName: "cdk-rs-rudak-bucket",
			websiteIndexDocument: "index.html",
			publicReadAccess: false,
			blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
		});

		siteBucket.addToResourcePolicy(
			new iam.PolicyStatement({
				actions: ["s3:GetObject"],
				resources: [siteBucket.arnForObjects("*")],
				principals: [
					new iam.CanonicalUserPrincipal(
						cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
					),
				],
			})
		);

		const distribution = new cloudfront.CloudFrontWebDistribution(
			this,
			"SiteDistribution",
			{
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: siteBucket,
							originAccessIdentity: cloudfrontOAI,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
							},
						],
					},
				],
			}
		);

		new s3deploy.BucketDeployment(this, "DeployWebsite", {
			sources: [s3deploy.Source.asset("../build")],
			destinationBucket: siteBucket,
			distribution: distribution,
			distributionPaths: ["/*"],
		});
	}
}
