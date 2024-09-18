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
      console.log(`Attempting to get cached data for ${username}`);
      let cachedData;
      try {
        cachedData = await getCache(cacheKey);
        console.log(`Cached data for ${username}:`, cachedData);
      } catch (cacheError) {
        console.error(`Error getting cache for ${username}:`, cacheError);
      }
    
      if (cachedData) {
        if (typeof cachedData === 'object') {
          console.log(`Cached data for ${username} is already an object, using as-is`);
          return cachedData;
        }
        try {
          const parsedData = JSON.parse(cachedData);
          console.log(`Successfully parsed cached data for ${username}`);
          return parsedData;
        } catch (parseError) {
          console.error(`Error parsing cached data for ${username}:`, parseError);
          console.log(`Raw cached data for ${username}:`, cachedData);
        }
      }
    
      console.log(`Fetching fresh data for ${username}`);
      const userData = await getGitHubData(username);
      console.log(`Fresh data fetched for ${username}:`, userData);
      
      try {
        await setCache(cacheKey, userData);
        console.log(`Successfully cached data for ${username}`);
      } catch (setCacheError) {
        console.error(`Error setting cache for ${username}:`, setCacheError);
      }
    
      return userData;
    };

    console.log('Fetching data for both users');
    const [user1Data, user2Data] = await Promise.all([
      getData(username1),
      getData(username2)
    ]);

    console.log('Successfully fetched data for both users');
    res.status(200).json({ user1: user1Data, user2: user2Data });
  } catch (error) {
    console.error('Error in rank API:', error);
    res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
  }
}