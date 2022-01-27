const core = require('@actions/core');
const github = require('@actions/github');

async function fetchIds(token, version) {
  const octokit = github.getOctokit(token)
  const {owner, repo} = github.context.repo
  const response = await octokit.graphql(
    `query Versions($repo: String!, $version: String!, $owner:String!) { 
        repository(name: $repo, owner: $owner) {
          packages(first:100) {
            nodes {
              version(version: $version) {
                id
              }
            }
          }
        }
      
    }
    `,
    {
      repo, 
      version,
      owner
    }
  );
  return response.repository.packages.nodes
    .map(i => i.version)
    .filter(i => i !== null)
    .map(i => i.id)
    .join(',');
}

async function main() {
  try {
    const version = core.getInput('version');
    const token = core.getInput('token') || process.env.GITHUB_TOKEN;
    const ids = await fetchIds(token, version);
    core.setOutput("ids", ids);
  } catch (error) {
    console.log(error)
    core.setFailed(error.message);
  }  
}

main()

