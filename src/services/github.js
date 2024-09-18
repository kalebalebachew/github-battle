import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/users/';

export async function getGitHubData(username) {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`${GITHUB_API_URL}${username}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }),
      axios.get(`${GITHUB_API_URL}${username}/repos`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        params: {
          per_page: 100,
          sort: 'pushed',
          direction: 'desc'
        },
      }),
    ]);

    const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    // Fetch commit counts for each repository
    const commitPromises = reposResponse.data.slice(0, 5).map(repo => 
      axios.get(`https://api.github.com/repos/${username}/${repo.name}/commits`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        params: {
          per_page: 1,
        },
      }).catch(error => {
        console.warn(`Failed to fetch commits for ${repo.name}: ${error.message}`);
        return { headers: { link: '' } };
      })
    );

    const commitResponses = await Promise.allSettled(commitPromises);
    const totalCommits = commitResponses.reduce((sum, response) => {
      if (response.status === 'fulfilled') {
        const linkHeader = response.value.headers['link'] || '';
        const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
        const commitCount = match ? parseInt(match[1], 10) : 1;
        return sum + commitCount;
      }
      return sum;
    }, 0);

    return {
      username,
      followers: userResponse.data.followers,
      publicRepos: userResponse.data.public_repos,
      totalStars,
      totalCommits,
      pullRequests: userResponse.data.public_gists,
      issues: userResponse.data.open_issues_count,
      createdAt: new Date(userResponse.data.created_at),
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error);
    throw error;
  }
}