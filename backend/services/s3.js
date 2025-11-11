// backend/services/s3.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

// Ensure backend .env contains AWS credentials/bucket if they are present in the
// process environment but not in the file. This is a convenience for local
// development where creds may be set in the shell but not committed to .env.
function ensureEnvHasAwsSettings() {
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    const raw = fs.readFileSync(envPath, 'utf8');
    const present = {};
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=/i);
      if (m) present[m[1]] = true;
    });

    const keys = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN', 'AWS_REGION', 'S3_BUCKET'];
    const toAppend = [];
    for (const k of keys) {
      if (!present[k] && process.env[k]) {
        // Quote values containing spaces or special chars
        const v = String(process.env[k]);
        const safe = /[\s\"'\\]/.test(v) ? `\"${v.replace(/\"/g, '\\\"')}\"` : v;
        toAppend.push(`${k}=${safe}`);
      }
    }
    if (toAppend.length > 0) {
      fs.appendFileSync(envPath, '\n# Appended by services/s3.js for local AWS credentials\n' + toAppend.join('\n') + '\n');
      console.log('Appended missing AWS settings to', envPath);
    }
  } catch (e) {
    console.warn('Could not ensure .env AWS settings:', e && e.message ? e.message : String(e));
  }
}

// Try to auto-populate .env with env creds (safe convenience; does not overwrite existing keys)
ensureEnvHasAwsSettings();

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
