import axios from 'axios';

const GITHUB_API_URL = 'https://api.github.com/users/';
const GITHUB_GRAPHQL_API_URL = 'https://api.github.com/graphql';
const GITHUB_CONTRIBUTIONS_API_URL = 'https://github-contributions-api.jogruber.de/v4';

const MAX_RETRIES = 3;

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    return await axios(url, options);
  } catch (error) {
    if (retries > 0 && error.code === 'ECONNRESET') {
      console.warn(`Retrying request to ${url}... (${MAX_RETRIES - retries + 1})`);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function getGitHubData(username) {
  try {
    const [userResponse, reposResponse, contributionData] = await Promise.all([
      fetchWithRetry(`${GITHUB_API_URL}${username}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }),
      fetchWithRetry(`${GITHUB_API_URL}${username}/repos`, {
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
      totalCommits: contributionData.totalCommits || 0,
      totalPullRequests: contributionData.totalPullRequests || 0,
      totalIssues: contributionData.totalIssues || 0,
      createdAt: new Date(userResponse.data.created_at),
    };
  } catch (error) {
    console.error(`Error fetching GitHub data for ${username}:`, error);
    throw error;
  }
}

async function fetchCommitsFromContributionsAPI(username) {
  try {
    const response = await fetchWithRetry(`${GITHUB_CONTRIBUTIONS_API_URL}/${username}`);
    if (response.status === 200) {
      const currentYear = new Date().getFullYear();
      const totalCommitsCurrentYear = response.data.total && response.data.total[currentYear] ? response.data.total[currentYear] : 0;
      return totalCommitsCurrentYear;
    } else {
      console.error(`Error fetching commits for ${username}: ${response.status} - ${response.statusText}`);
      return 0;
    }
  } catch (error) {
    console.error(`Error fetching commits for ${username} from contributions API:`, error);
    return 0;
  }
}

async function fetchPullRequestsAndIssues(username) {
  const query = `
    query($username: String!, $after: String) {
      user(login: $username) {
        contributionsCollection {
          pullRequestContributions(first: 100, after: $after) {
            totalCount
            pageInfo {
              hasNextPage
              endCursor
            }
          }
          issueContributions(first: 100) {
            totalCount
          }
        }
      }
    }
  `;

  let totalPullRequests = 0;
  let totalIssues = 0;
  let hasNextPage = true;
  let after = null;

  try {
    const totalCommits = await fetchCommitsFromContributionsAPI(username);

    while (hasNextPage) {
      const response = await fetchWithRetry(GITHUB_GRAPHQL_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: { query, variables: { username, after } },
      });

      const contributionsCollection = response.data.data.user.contributionsCollection || {};
      const pullRequestContributions = contributionsCollection.pullRequestContributions || { totalCount: 0, pageInfo: { hasNextPage: false } };
      const issueContributions = contributionsCollection.issueContributions || { totalCount: 0 };

      totalPullRequests += pullRequestContributions.totalCount;
      totalIssues += issueContributions.totalCount;
      hasNextPage = pullRequestContributions.pageInfo.hasNextPage;
      after = pullRequestContributions.pageInfo.endCursor;
    }

    console.log(`Total Commits for 2024: ${totalCommits}, Total Merged Pull Requests: ${totalPullRequests}, Total Issues: ${totalIssues}`);

    return {
      totalCommits,
      totalPullRequests,
      totalIssues,
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