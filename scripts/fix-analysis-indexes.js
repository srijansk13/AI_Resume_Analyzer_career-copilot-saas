const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read and parse MONGODB_URI from .env.local
let mongodbUri = '';
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=["']?([^"\n\r']+)["']?/);
    if (match) {
      mongodbUri = match[1];
    }
  }
} catch (err) {
  console.error("Error reading .env.local file:", err);
}

// Fallback to environment variable if present
mongodbUri = mongodbUri || process.env.MONGODB_URI;

if (!mongodbUri) {
  console.error("Error: MONGODB_URI not found in .env.local or process.env");
  process.exit(1);
}

async function fixIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongodbUri);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collectionName = 'analyses';
    
    // Get existing indexes
    console.log(`Listing indexes on '${collectionName}' collection...`);
    let indexes = await db.collection(collectionName).indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Check if resumeId_1 index exists and drop it safely
    const resumeIdIndex = indexes.find(idx => idx.name === 'resumeId_1');
    if (resumeIdIndex) {
      console.log("Found unique/old 'resumeId_1' index. Dropping it...");
      try {
        await db.collection(collectionName).dropIndex('resumeId_1');
        console.log("Successfully dropped 'resumeId_1' index!");
      } catch (dropErr) {
        console.warn("Notice: could not drop resumeId_1 directly:", dropErr.message);
      }
    } else {
      console.log("'resumeId_1' index was not found or already dropped.");
    }

    // Refresh the index list before processing other indexes
    indexes = await db.collection(collectionName).indexes();

    // Drop other old unique indexes on resumeId if any exist
    for (const idx of indexes) {
      if (idx.key && idx.key.resumeId && idx.unique && idx.name !== '_id_') {
        console.log(`Dropping unique index '${idx.name}'...`);
        try {
          await db.collection(collectionName).dropIndex(idx.name);
          console.log(`Successfully dropped unique index '${idx.name}'!`);
        } catch (dropErr) {
          console.warn(`Notice: could not drop unique index ${idx.name}:`, dropErr.message);
        }
      }
    }

    // Create the non-unique indexes as specified
    console.log("Creating non-unique index on { resumeId: 1, createdAt: -1 }...");
    await db.collection(collectionName).createIndex(
      { resumeId: 1, createdAt: -1 },
      { name: "resumeId_1_createdAt_-1" }
    );
    console.log("Created resumeId_1_createdAt_-1 index successfully.");

    console.log("Creating optional index on { analysisSource: 1 }...");
    await db.collection(collectionName).createIndex(
      { analysisSource: 1 },
      { name: "analysisSource_1" }
    );
    console.log("Created analysisSource_1 index successfully.");

    // List final indexes
    const finalIndexes = await db.collection(collectionName).indexes();
    console.log("Final indexes after migration:", JSON.stringify(finalIndexes, null, 2));

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
}

fixIndexes();
