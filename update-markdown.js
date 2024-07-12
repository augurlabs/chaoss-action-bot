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
      const issueBody = issue.body;

      const markdownContent = `${issueBody}\n\n`;

      const filePath = 'contributions.md';
      fs.appendFileSync(filePath, markdownContent);

      console.log(`Issue description added to ${filePath}`);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();