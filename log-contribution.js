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

      // Log the issue body for debugging
      const issueBody = issue.body || "";
      console.log('Full Issue Body:', issueBody);

      // Default values
      let projectArea = "N/A";
      let dateCompleted = new Date().toISOString().split('T')[0];
      let typeOfContribution = "N/A";

      // Extract specific lines based on labels
      issueBody.split('\n').forEach(line => {
        if (line.startsWith("Specify Area of Project")) {
          projectArea = line.split('Specify Area of Project')[1]?.trim() || projectArea;
        } else if (line.startsWith("Date of Completion")) {
          dateCompleted = line.split('Date of Completion')[1]?.trim() || dateCompleted;
        } else if (line.startsWith("Specify the type of contribution")) {
          typeOfContribution = line.split('Specify the type of contribution')[1]?.trim() || typeOfContribution;
        }
      });

      // Assume the task description comes from the issue title
      const taskCompleted = issue.title.replace('[Project]:', '').trim();

      // Create a new row for the markdown table
      const newRow = `| @${username} | ${taskCompleted} | ${projectArea} | ${dateCompleted} | ${typeOfContribution} |\n`;

      const filePath = 'community-contributions.md';
      const fileContents = fs.readFileSync(filePath, 'utf-8');

      console.log('Original File Contents:');
      console.log(fileContents);

      // Append the new row to the existing content
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
