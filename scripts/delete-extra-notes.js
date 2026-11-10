const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

async function main() {
  const notesPath = path.join(__dirname, '..', 'src', 'data', 'notes.json');
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'));

  const idsToDelete = ['admin-note-01', 'admin-note-02', 'admin-note-04', 'admin-note-05'];
  const filteredNotes = notes.filter(n => !idsToDelete.includes(n.id));

  fs.writeFileSync(notesPath, JSON.stringify(filteredNotes, null, 2), 'utf8');
  console.log(`Deleted ${notes.length - filteredNotes.length} notes from notes.json. Remaining: ${filteredNotes.length}`);

  // Delete from MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sacwac');
    
    const r1 = await db.collection('notedocs').deleteMany({ id: { $in: idsToDelete } });
    console.log(`Deleted from 'notedocs': ${r1.deletedCount}`);

    const r2 = await db.collection('notes').deleteMany({ id: { $in: idsToDelete } });
    console.log(`Deleted from 'notes': ${r2.deletedCount}`);
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
