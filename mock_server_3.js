const WebSocket = require("ws");
const express = require("express");

const app = express();
const port = 3002;

// WebSocket Server
const wss = new WebSocket.Server({ noServer: true });

// Sample Matches Data
const matches = [
    {
        id: "m1",
        sport: "cricket",
        teams: {
            home: { name: "India", logo: "/cricket/india.jpg", odds: 1.8 },
            away: { name: "Australia", logo: "/cricket/australia.jpg", odds: 2.2 }
        },
        startTime: "2025-02-18T18:45:00",
        status: "live",
        score: { home: 0, away: 0 },
        maxBettingAmount: 1000,
        currentBettors: 0,
        winner: null
    },
    {
        id: "m2",
        sport: "football",
        teams: {
            home: { name: "Real Madrid", logo: "/football/madrid.jpg", odds: 1.6 },
            away: { name: "Barcelona", logo: "/football/barcelona.jpg", odds: 2.3 }
        },
        startTime: "2025-02-18T19:30:00",
        status: "live",
        score: { home: 0, away: 0 },
        maxBettingAmount: 1500,
        currentBettors: 0,
        winner: null
    }
];

// Simulate real-time updates every 5 seconds
function generateMatchUpdates() {
    setInterval(() => {
        matches.forEach(match => {
            if (match.status === "live" && !match.winner) {
                // Randomly update scores
                match.score.home += Math.floor(Math.random() * 10);
                match.score.away += Math.floor(Math.random() * 10);

                // Simulate betting activity
                match.currentBettors = Math.floor(Math.random() * 50);

                // Check for winner
                if (match.score.home > 1000) match.winner = match.teams.home.name;
                if (match.score.away > 1000) match.winner = match.teams.away.name;

                // Broadcast match update
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(match));
                    }
                });

                // Trigger smart contract action if a winner is decided
                if (match.winner) {
                    triggerSmartContract(match);
                }
            }
        });
    }, 5000);
}

// Simulated Smart Contract Execution
function triggerSmartContract(match) {
    console.log(`🏆 Match Winner Declared: ${match.winner}`);
    console.log(`💰 Triggering Smart Contract Settlement for match: ${match.id}`);
    // Call blockchain contract execution here (e.g., using Aptos SDK)
}

// HTTP Route
app.get("/", (req, res) => res.send("Mock Server Running"));

// Start HTTP and WebSocket server
const server = app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
    generateMatchUpdates();
});

// WebSocket Connection Handling
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit("connection", ws, request);
    });
});
