import * as AWS from '@aws-sdk/client-s3';
import * as dotenv from "dotenv";
import { uuid } from "uuidv4";

dotenv.config();
// const s3 = new AWS.S3({
//     region: process.env.AWS_REGION,
//     secretAccessKey: process.env.AWS_SECERT_ACCESS_KEY,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID
// })

const BUCKET_NAME = "happymangotest";
const s3Client = new AWS.S3Client({
    // "Version": "2024-06-05",
    // "Statement": [
    //     {
    //         "Effect": "Allow",
    //         "Action": [
    //             "s3: PutObject"
    //         ],
    //         "Resource": `arn:aws:s3:${BUCKET_NAME}/*`
    //     }
    // ]
})

const uploadToS3 = async (data: Buffer): Promise<string> => {
    const name = uuid() + ".jpeg"
    const params = {
        Body: data,
        Bucket: BUCKET_NAME,
        Key: name
    }
    try{
        const command = new AWS.PutObjectCommand(params);
        const response = await s3Client.send(command);
    } catch (err) {
        console.error("Error uploading file", err);
    }
    // await s3.putObject({
    //     Key: name,
    //     Bucket: BUCKET_NAME,
    //     ContentType: 'image/jpeg',
    //     Body: data,
    //     ACL: 'public-read'
    // }).promise();
    return name;
}

export { uploadToS3 }