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

      // Extract details from the issue body using structured YAML template format
      const issueBody = issue.body || "";
      
      // Use specific markers from the YAML template to extract data
      const taskCompleted = issue.title.replace('[Project]:', '').trim(); // Title of the issue as task
      const projectArea = issueBody.match(/Specify Area of Project \(1 - 5 words\)\n\n.*?\n\n(.*?)\n/)?.[1] || "N/A";
      const dateCompleted = issueBody.match(/Date of Completion\n\n.*?\n\n(.*?)\n/)?.[1] || new Date().toISOString().split('T')[0];
      const typeOfContribution = issueBody.match(/Specify the type of contribution.*?\n\n(.*?)\n/)?.[1] || "N/A";

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
