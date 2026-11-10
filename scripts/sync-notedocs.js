const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

async function main() {
  const notesPath = path.join(__dirname, '..', 'src', 'data', 'notes.json');
  const localNotes = JSON.parse(fs.readFileSync(notesPath, 'utf8'));

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sacwac');
    const collection = db.collection('notedocs');

    console.log(`Syncing ${localNotes.length} notes into MongoDB collection 'notedocs'...`);
    let count = 0;
    for (const note of localNotes) {
      await collection.updateOne(
        { id: note.id },
        { $set: note },
        { upsert: true }
      );
      count++;
    }

    console.log(`Successfully synced ${count} notes to MongoDB notedocs!`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Sync error:", err);
  process.exit(1);
});
