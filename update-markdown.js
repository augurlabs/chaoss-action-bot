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

      const filePath = 'contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const updatedContents = fileContents.replace(
        /(\| @[\w-]+.*\n)+/,
        `$&${newRow}`
      );

      fs.writeFileSync(filePath, updatedContents);

      console.log(`New contribution added to ${filePath}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();