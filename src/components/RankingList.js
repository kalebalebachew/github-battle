export default function RankingList({ rankings }) {
  if (!rankings || rankings.length === 0) {
    return <p>No ranking data available.</p>;
  }

  if (!Array.isArray(rankings)) {
    console.error('Rankings data is not an array:', rankings);
    return <p>Error: Invalid ranking data received.</p>;
  }

  return (
    <ul className="ranking-list">
      {rankings.map((user, index) => (
        <li key={user.username} className="ranking-item">
          <span className="rank">{index + 1}</span>
          <span className="username">{user.username}</span>
          <span className="score">{user.score}</span>
        </li>
      ))}
    </ul>
  );
}