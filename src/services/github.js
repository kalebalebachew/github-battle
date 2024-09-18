import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/users/';

export async function getGitHubData(username) {
  try {
    const [userResponse, reposResponse, eventsResponse] = await Promise.all([
      axios.get(`${GITHUB_API_URL}${username}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }),
      axios.get(`${GITHUB_API_URL}${username}/repos`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }),
      axios.get(`${GITHUB_API_URL}${username}/events`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }),
    ]);

    const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

   
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const contributions = eventsResponse.data.filter(
      event => event.type === 'PushEvent' && new Date(event.created_at) > oneYearAgo
    ).length;

 
    const pullRequests = eventsResponse.data.filter(event => event.type === 'PullRequestEvent').length;
    const issues = eventsResponse.data.filter(event => event.type === 'IssuesEvent').length;

    return {
      username,
      followers: userResponse.data.followers,
      publicRepos: userResponse.data.public_repos,
      totalStars,
      contributions,
      pullRequests,
      issues,
      createdAt: new Date(userResponse.data.created_at),
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        username,
        error: 'User not found'
      };
    }
    console.error(`Error fetching data for ${username}:`, error);
    throw error;
  }
}