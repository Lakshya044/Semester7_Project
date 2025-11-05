// backend/services/s3.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

function getClient() {
  const region = process.env.AWS_REGION;
  if (!region) throw new Error('AWS_REGION not set');
  return new S3Client({ region });
}

async function s3PutFile(localPath, key, contentType = 'application/pdf') {
  const s3 = getClient();
  const Body = fs.createReadStream(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body,
    ContentType: contentType,
  }));
}

async function s3GetToPath(key, destPath) {
  const s3 = getClient();
  const res = await s3.send(new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await pipeline(res.Body, fs.createWriteStream(destPath));
}

async function s3Presign(key, expiresSec = 600) {
  const s3 = getClient();
  const cmd = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: expiresSec });
}

module.exports = { s3PutFile, s3GetToPath, s3Presign };
