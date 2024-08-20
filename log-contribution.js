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

      // Log the full issue body for debugging
      console.log('Issue Body:');
      console.log(issue.body);

      // Extract details from the issue body using structured YAML template format
      const issueBody = issue.body || "";
      
      // Log the entire issue body to understand the structure
      console.log('Full issue body for debugging:', issueBody);

      // Improved extraction with explicit string matching
      const taskCompleted = issue.title.replace('[Project]:', '').trim(); // Title of the issue as task
      const projectArea = extractValue(issueBody, 'Specify Area of Project');
      const dateCompleted = extractValue(issueBody, 'Date of Completion');
      const typeOfContribution = extractValue(issueBody, 'Specify the type of contribution');

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

// Helper function to extract values based on label
function extractValue(body, label) {
  const regex = new RegExp(`${label}\\s*\\n+\\s*(.+)`, 'i');
  const match = body.match(regex);
  return match ? match[1].trim() : 'N/A';
}
