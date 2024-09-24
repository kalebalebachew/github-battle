import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/users/';
const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql';

export async function getGitHubData(username) {
  try {
    const [userResponse, reposResponse, contributionData] = await Promise.all([
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
          direction: 'desc',
        },
      }),
      fetchPullRequestsAndIssues(username),  
    ]);

    const totalStars = reposResponse.data.reduce((sum, repo) => sum + repo.stargazers_count, 0);

    return {
      username,
      followers: userResponse.data.followers,
      publicRepos: userResponse.data.public_repos,
      totalStars,
      totalCommits: contributionData.totalCommits,  
      totalPullRequests: contributionData.totalPullRequests,  
      totalIssues: contributionData.totalIssues, 
      createdAt: new Date(userResponse.data.created_at),
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error);
    throw error;
  }
}

async function fetchPullRequestsAndIssues(username) {
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          totalCommitContributions
          pullRequestContributions(first: 100) {
            totalCount
          }
          issueContributions(first: 100) {
            totalCount
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      GITHUB_GRAPHQL_API_URL,
      { query },
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const { totalCommitContributions, pullRequestContributions, issueContributions } = response.data.data.user.contributionsCollection;

    return {
      totalCommits: totalCommitContributions,
      totalPullRequests: pullRequestContributions.totalCount,
      totalIssues: issueContributions.totalCount,
    };
  } catch (error) {
    console.error(`Error fetching pull requests and issues for ${username}:`, error);
    return {
      totalCommits: 0,
      totalPullRequests: 0,
      totalIssues: 0,
    };
  }
}
