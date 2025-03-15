export interface LeaderboardEntry {
  userId: number;
  wins: number;
  losses: number;
  totalGames: number;
  rank: number;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
}
