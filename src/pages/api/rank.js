import { getGitHubData } from '../../services/github';
import { getCache, setCache } from '../../lib/redis';

export default async function handler(req, res) {
  const { usernames } = req.query;

  if (!usernames) {
    return res.status(400).json({ error: 'Missing usernames' });
  }

  const [username1, username2] = usernames.split(',');

  if (!username1 || !username2) {
    return res.status(400).json({ error: 'Two usernames are required' });
  }

  try {
    const getData = async (username) => {
      const cacheKey = `${username}:fullData`;
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const userData = await getGitHubData(username);
      await setCache(cacheKey, JSON.stringify(userData));
      return userData;
    };

    const [user1Data, user2Data] = await Promise.all([
      getData(username1),
      getData(username2)
    ]);

    res.status(200).json({ user1: user1Data, user2: user2Data });
  } catch (error) {
    console.error('Error in rank API:', error);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
}