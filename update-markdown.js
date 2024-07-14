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
      const issueBody = issue.body ? issue.body.trim() : "No description provided.";
      const newRow = `| @${username} | ${issueBody} | | | |\n`;

      const filePath = 'community-contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');

      console.log('Original File Contents:');
      console.log(fileContents);

      // Find the position to insert the new row
      const tableEndIndex = fileContents.lastIndexOf('|-----------------|');
      const insertionPoint = fileContents.indexOf('\n', tableEndIndex) + 1;

      const updatedContents = [
        fileContents.slice(0, insertionPoint),
        newRow,
        fileContents.slice(insertionPoint)
      ].join('');

      fs.writeFileSync(filePath, updatedContents);
      
      console.log('New Row to Add:');
      console.log(newRow);

      console.log('Updated File Contents:');
      console.log(updatedContents);

      console.log(`New contribution added to ${filePath}`);
    } else {
      console.log('No "contribution" label found, skipping update.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();