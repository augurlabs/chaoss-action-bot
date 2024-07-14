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

      // Extract details from the issue body
      const issueBody = issue.body || "";
      const lines = issueBody.split('\n');
      let taskCompleted = "No description provided.";
      let projectArea = "N/A";
      let dateCompleted = new Date().toISOString().split('T')[0];
      let typeOfContribution = "N/A";

      lines.forEach(line => {
        if (line.startsWith("**Task Completed**:")) {
          taskCompleted = line.replace("**Task Completed**:", "").trim();
        } else if (line.startsWith("**Project Area**:")) {
          projectArea = line.replace("**Project Area**:", "").trim();
        } else if (line.startsWith("**Date Completed**:")) {
          dateCompleted = line.replace("**Date Completed**:", "").trim();
        } else if (line.startsWith("**Type of Contribution**:")) {
          typeOfContribution = line.replace("**Type of Contribution**:", "").trim();
        }
      });

      const newRow = `| @${username} | ${taskCompleted} | ${projectArea} | ${dateCompleted} | ${typeOfContribution} |\n`;

      const filePath = 'community-contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');

      console.log('Original File Contents:');
      console.log(fileContents);

      const updatedContents = fileContents + newRow;

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