import AWS from "aws-sdk";

const s3 = new AWS.S3({
    endpoint: process.env.WASABI_ENDPOINT,
    accessKeyId: process.env.WASABI_ACCESS_KEY,
    secretAccessKey: process.env.WASABI_SECRET_KEY,
    region: process.env.WASABI_REGION,
    signatureVersion: "v4",
});

export default async function handler(req, res) {
    const { file } = req.query;
    if (!file) return res.status(400).json({ error: "File name is required" });

    try {
        const url = await s3.getSignedUrlPromise("getObject", {
            Bucket: process.env.WASABI_BUCKET_NAME,
            Key: file,
            Expires: 604800, // 7 days
        });
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve file" });
    }
} 