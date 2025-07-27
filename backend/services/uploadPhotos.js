import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3Client } from "../db/s3.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.AWS_BUCKET_NAME;
export function uploadFile(fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,
  };

  return s3Client.send(new PutObjectCommand(uploadParams));
}

export function deleteFile(fileName) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}

export async function getObjectSignedUrl(key) {
  const params = {
    Bucket: bucketName,
    Key: key,
  };
  // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  const command = new GetObjectCommand(params);
  const seconds = 60;
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url;
}
export function generateFileName(type, id, userId) {
  return `post-${type}-${id}-${userId}`;
}
