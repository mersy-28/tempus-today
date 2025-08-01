import 'dotenv/config';
import fetch from 'node-fetch';

const token = process.env.GITHUB_TOKEN;
const owner = 'mersy-28';
const repo = 'tempus-today';

async function listIssues() {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  const issues = await response.json();
  console.log(issues);
}

listIssues();