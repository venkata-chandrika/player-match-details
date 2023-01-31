const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running....");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
const playerDetails = (obj) => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  };
};
//ap1 get players details
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT * FROM player_details;`;
  const playerArr = await db.all(playersQuery);
  response.send(playerArr.map((each) => playerDetails(each)));
});
//get player-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
    SELECT * FROM player_details
    WHERE player_id=${playerId};`;
  const playerArr = await db.get(playersQuery);
  response.send(playerDetails(playerArr));
});
//update PLAYER
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playersQuery = `
    UPDATE
      player_details 
    SET 
      player_name='${playerName}';`;
  const player = await db.run(playersQuery);
  response.send("Player Details Updated");
});

//GET MATCH-18
const matchDetails = (obj) => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  };
};
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const playersQuery = `
    SELECT * FROM match_details
    WHERE match_id=${matchId};`;
  const playerArr = await db.get(playersQuery);
  response.send(matchDetails(playerArr));
});
//get player matched details

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
    SELECT 
     *
    FROM  player_match_score 
        NATURAL JOIN match_details
    WHERE player_id=${playerId}
    `;
  const matchArr = await db.all(playersQuery);
  response.send(matchArr.map((eachMatch) => matchDetails(eachMatch)));
});
//get playerDetails from given matchid
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersFromMatchQuery = `
     SELECT 
        player_id AS playerId,
        player_name AS playerName      
     FROM player_details
      NATURAL JOIN  player_match_score 
     WHERE 
       match_id = ${matchId};`;
  const playerFromMatchDetails = await db.all(getPlayersFromMatchQuery);
  response.send(playerFromMatchDetails);
});

//Path: /players/:playerId/playerScores Method: GET
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerScoreQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE 
        player_id = ${playerId};`;
  const playerScoreArr = await db.get(playerScoreQuery);
  response.send(playerScoreArr);
});
module.exports = app;
