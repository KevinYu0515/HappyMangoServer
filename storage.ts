import * as dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const BUCKET_NAME = process.env.BUCKET_NAME as string;
const s3Config = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    }
})

const uploadToS3 = multer({
    storage: multerS3({
        s3: s3Config,
        bucket: BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, {fieldName: file.fieldname});
        },
        key: (req, file, cb) => {
            cb(null, uuidv4().toString());
        }
    })
})

const getImageFromS3 = async (params: {key: string}) => {
    const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: params.key
    }
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3Config, command, { expiresIn: 3600 });
    return url;
}

export { uploadToS3, getImageFromS3 }