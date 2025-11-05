// backend/routes/files.js
const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const Collection = require('../models/Collection');
const { s3Presign } = require('../services/s3');

const router = express.Router();

// Get a presigned URL for viewing a stored document (S3 key is storedName)
router.get('/presign/:collectionId/:storedName', requireAuth, async (req, res) => {
  try {
    const { collectionId, storedName } = req.params;
    const col = await Collection.findOne({ _id: collectionId, userId: req.userId }).lean();
    if (!col) return res.status(404).json({ error: 'Collection not found' });
    const doc = (col.documents || []).find(d => d.storedName === storedName);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const url = await s3Presign(storedName, 600);
    return res.json({ url });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to presign', details: e && e.message ? e.message : String(e) });
  }
});

module.exports = router;
