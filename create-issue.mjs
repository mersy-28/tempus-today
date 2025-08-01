import 'dotenv/config';
import fetch from 'node-fetch';

const token = process.env.GITHUB_TOKEN;
const owner = 'mersy-28';
const repo = 'tempus-today';

async function createIssue(title, body) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      body: body
    })
  });

  const data = await response.json();
  console.log(data);
}

createIssue("Test Issue from API", "This is a test issue created via the GitHub API.");