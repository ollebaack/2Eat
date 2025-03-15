import { fetchLeaderboard } from "../Services/Leaderboard/api";
import useQuery from "../Helpers/useQuery";
import { Suspense } from "react";

const LeaderBoardPage = () => {
  const leaderboard = useQuery(fetchLeaderboard, "leaderboard");
  return (
    <div>
      <Suspense fallback={<div>Loading leaderboard...</div>}>
        <ul>
          {leaderboard?.map((entry) => (
            <li key={entry.userId}>
              User {entry.userId}: {entry.wins} Wins, {entry.losses} Losses,
              Rank {entry.rank}
            </li>
          ))}
        </ul>
      </Suspense>
    </div>
  );
};

export default LeaderBoardPage;
