const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://sacwacsalesforce_db_user:h69WbIsgStKWMGWc@sacwac.fsn0zaz.mongodb.net/sacwac?retryWrites=true&w=majority";

async function main() {
  const videosPath = path.join(__dirname, '..', 'src', 'data', 'videos.json');
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

  let fixedCount = 0;
  for (const v of videos) {
    const match = v.title.match(/Episode\s*(\d+)/i);
    if (!match) {
      if (v.episode !== undefined) {
        console.log(`Removing episode ${v.episode} from non-episode video: "${v.title}"`);
        delete v.episode;
        delete v.noteId;
        v.hasNotes = false;
        fixedCount++;
      }
    } else {
      const correctEp = parseInt(match[1], 10);
      if (v.episode !== correctEp) {
        console.log(`Fixing episode from ${v.episode} to ${correctEp} for: "${v.title}"`);
        v.episode = correctEp;
        fixedCount++;
      }
    }
  }

  fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2), 'utf8');
  console.log(`Updated ${fixedCount} videos in src/data/videos.json`);

  // Update in MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('sacwac');
    const videosColl = db.collection('videos');

    for (const v of videos) {
      if (v.episode === undefined) {
        await videosColl.updateOne(
          { id: v.id },
          { 
            $unset: { episode: "", noteId: "" },
            $set: { hasNotes: false }
          }
        );
      } else {
        await videosColl.updateOne(
          { id: v.id },
          { 
            $set: { 
              episode: v.episode,
              noteId: v.noteId,
              hasNotes: v.hasNotes
            } 
          }
        );
      }
    }
    console.log("Successfully synced all video episode changes to MongoDB 'videos' collection!");
  } finally {
    await client.close();
  }
}

main().catch(err => {
  console.error("Error fixing episodes:", err);
  process.exit(1);
});
