const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);

    const { context } = github;
    const { issue } = context.payload;

    if (issue.labels.some(label => label.name === 'contribution')) {
      const username = issue.user.login;
      const issueBody = issue.body;
      const newRow = `| @${username} | ${issueBody} | | | |\n`;

      const filePath = 'community-contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      
      console.log('Original File Contents:');
      console.log(fileContents);

      const updatedContents = fileContents.replace(
        /(## Community Contributions\n\n\| GitHub Username \| Task completed[^\n]+\n\|[^\n]+\n)/,
        `$1${newRow}`
      );

      fs.writeFileSync(filePath, updatedContents);
      
      console.log('Updated File Contents:');
      console.log(updatedContents);

      console.log(`New contribution added to ${filePath}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();