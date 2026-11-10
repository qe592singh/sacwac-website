const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

async function main() {
  const notesPath = path.join(__dirname, '..', 'src', 'data', 'notes.json');
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'));

  const publicAdminDir = path.join(__dirname, '..', 'public', 'docs', 'admin');
  const availableFiles = fs.readdirSync(publicAdminDir);

  let updatedCount = 0;
  for (const note of notes) {
    if (note.category === 'Admin' && typeof note.episode === 'number') {
      const fileName = `admin_episode_${note.episode}_notes.pdf`;
      if (availableFiles.includes(fileName)) {
        note.pdfUrl = `/docs/admin/${fileName}`;
        updatedCount++;
      }
    }
  }

  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} notes in notes.json with /docs/admin/ URLs`);

  // Update MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sacwac');
    const notesColl = db.collection('notes');

    for (const note of notes) {
      if (note.category === 'Admin' && typeof note.episode === 'number' && note.pdfUrl) {
        await notesColl.updateOne(
          { id: note.id },
          { $set: { pdfUrl: note.pdfUrl } }
        );
      }
    }
    console.log('Successfully updated MongoDB notes collection with /docs/admin/ URLs');
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error('Update error:', err);
  process.exit(1);
});
