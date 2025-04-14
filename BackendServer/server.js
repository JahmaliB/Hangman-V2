const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let db;
let playersCollection;
let gameResultsCollection;

async function connectDB() {
  await client.connect();
  db = client.db('hangman');
  playersCollection = db.collection('players');
  gameResultsCollection = db.collection('game_results');
  console.log('Connected to MongoDB');
}
connectDB();

// Record game outcome
app.post('/api/record-outcome', async (req, res) => {
  const { playerName, isWin } = req.body;
  if (!playerName) return res.status(400).json({ error: "Missing playerName" });

  try {
    // Save game result
    await gameResultsCollection.insertOne({ playerName, isWin });

    // Update or insert player stats
    const update = {
      $inc: {
        totalGames: 1,
        wins: isWin ? 1 : 0
      }
    };
    const options = { upsert: true };
    await playersCollection.updateOne({ playerName }, update, options);

    res.send("Game outcome recorded");
  } catch (err) {
    console.error('Error recording outcome:', err);
    res.status(500).send("Error saving outcome");
  }
});

// Get win percentage
app.get('/api/win-percentage', async (req, res) => {
  const playerName = req.query.playerName;
  if (!playerName) return res.status(400).json({ message: 'Missing player name' });

  try {
    const player = await playersCollection.findOne({ playerName });
    if (!player) {
      return res.json({ winPercentage: 0 });
    }

    const winPercentage = (player.wins / player.totalGames) * 100;
    res.json({ winPercentage: winPercentage.toFixed(2) });
  } catch (err) {
    console.error('Error fetching win percentage:', err);
    res.status(500).json({ message: 'Error fetching win percentage', error: err.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
