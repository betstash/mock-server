const WebSocket = require("ws");
const express = require("express");
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const port = 3001;

app.use(cors({
    origin:"*"
})); // Comment or remove this
app.use(bodyParser.json())

const server = app.listen(port, () => {
    generateMatchUpdates();
    console.log(`Mock server running at http://localhost:${port}`);
  });
  
  const wss = new WebSocket.Server({ server });
  

// Sample Matches Data
const matches = [
    {
      id: "m1",
      sport: "cricket",
      teams: {
        home: {
          name: "Mumbai Indians",
          logo: "/cricket/mumbai.jpg",
          odds: 1.75,
        },
        away: {
          name: "Chennai Super Kings",
          logo: "/cricket/chennai.jpg",
          odds: 2.1,
        },
      },
      startTime: "2025-02-18T14:30:00",
      maxBetting: 100,
      currentBettingMembers: 2,
      status: "live",
      users: [],
      score: { home: 0, away: 0 },
    },
    {
      id: "m2",
      sport: "football",
      teams: {
        home: {
          name: "Real Madrid",
          logo: "/football/madrid.jpg",
          odds: 1.6,
        },
        away: {
          name: "Barcelona",
          logo: "/football/barcelona.jpg",
          odds: 2.3,
        },
      },
      startTime: "2025-02-18T18:45:00",
      maxBetting: 100,
      currentBettingMembers: 2,
      status: "live",
      users: [],
      score: { home: 0, away: 0 },
    },
    {
      id: "m3",
      sport: "baseball",
      teams: {
        home: {
          name: "NY Yankees",
          logo: "/baseball/yankees.jpg",
          odds: 1.9,
        },
        away: {
          name: "Boston Red Sox",
          logo: "/baseball/redsox.jpg",
          odds: 1.85,
        },
      },
      startTime: "2025-02-18T17:00:00",
      maxBetting: 100,
      currentBettingMembers: 2,
      status: "live",
      users: [],
      score: { home: 0, away: 0 },
    },
    {
      id: "m4",
      sport: "cricket",
      teams: {
        home: {
          name: "Delhi Capitals",
          logo: "/cricket/delhi.jpg",
          odds: 2.05,
        },
        away: {
          name: "Rajasthan Royals",
          logo: "/cricket/rajasthan.jpg",
          odds: 1.8,
        },
      },
      startTime: "2025-02-18T20:00:00",
      maxBetting: 100,
      currentBettingMembers: 2,
      status: "upcoming",
      users: [],
      score: { home: 0, away: 0 },
    },
  ];
  
// Send initial matches data to a client when they connect
wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  // Send the entire matches array to the client
  ws.send(JSON.stringify({ type: "INITIAL_DATA", data: matches }));

  // Handle incoming messages from the client (if needed)
  ws.on("message", (message) => {
    console.log("Received message from client:", message.toString());
  });
});

// Simulate real-time updates every 5 seconds
function generateMatchUpdates() {
  setInterval(() => {
    matches.forEach((match) => {
      if (match.status === "live" && !match.winner) {
        // Randomly update scores
        match.score.home += Math.floor(Math.random() * 10);
        match.score.away += Math.floor(Math.random() * 10);

        // Simulate betting activity
        match.currentBettingMembers = Math.floor(Math.random() * 50);

        // Check for winner
        if (match.score.home > 100) match.winner = match.teams.home.name;
        if (match.score.away > 100) match.winner = match.teams.away.name;

        // Broadcast match update to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "MATCH_UPDATE", data: match }));
          }
        });

        // Trigger smart contract action if a winner is decided
        if (match.winner) {
          triggerSmartContract(match);
        }
      }
    });
  }, 5000); // Update every 5 seconds
}

// Simulated Smart Contract Execution
function triggerSmartContract(match) {
  console.log(`🏆 Match Winner Declared: ${match.winner}`);
  console.log(`💰 Triggering Smart Contract Settlement for match: ${match.id}`);
  // Call blockchain contract execution here (e.g., using Aptos SDK)
}

// HTTP Route to get initial matches data
app.get("/getdata", (req, res) => {
  res.json({ matches });
});


app.post("/place-bet", (req, res) => {

    console.log(req.body,"this is the req body");
    
    const { matchId, address, bettingAmount, team } = req.body;
  
    // Find the match by ID
    const match = matches.find((m) => m.id === matchId);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
  
    // Add a new bet entry for the user
    match.users.push({ address, bettingAmount, team });
    match.currentBettingMembers += 1; // Increment betting members count
  
    // Broadcast the updated match data to all WebSocket clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "MATCH_UPDATE", data: match }));
      }
    });
  
    res.json({ success: true, match });
  });

// Start generating match updates
generateMatchUpdates();