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
      let cachedData = null;

      try {
        cachedData = await getCache(cacheKey);
      } catch (cacheError) {
        console.error(`Cache error for ${username}:`, cacheError);
      }

      if (cachedData) {
        if (typeof cachedData === 'object') {
          return cachedData;
        }
        try {
          return JSON.parse(cachedData);
        } catch (parseError) {
          console.error(`Parse error for ${username}:`, parseError);
        }
      }

      try {
        const userData = await getGitHubData(username);
        
        try {
          await setCache(cacheKey, userData);
        } catch (setCacheError) {
          console.error(`Cache set error for ${username}:`, setCacheError);
        }

        return userData;
      } catch (fetchError) {
        console.error(`Fetch error for ${username}:`, fetchError);
        return null;
      }
    };

    const [user1Data, user2Data] = await Promise.all([
      getData(username1),
      getData(username2)
    ]);

    if (!user1Data || !user2Data) {
      return res.status(404).json({ error: 'One or both users not found' });
    }

    res.status(200).json({ user1: user1Data, user2: user2Data });
  } catch (error) {
    console.error('Error in rank API:', error);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
}