import { printSchema, buildSchema, print } from 'graphql';
import { GithubLoader } from '../src';
const fetch = require("node-fetch")

const owner = 'kfazinic';
const name = 'graphql-git-schema';
const ref = 'main';
const path = 'schema.graphqls';
const token = "";

test('load schema from Github', async () => {

  /**
   * Fetch graphql type definitions from a Github file using credentials above,
   * in this case: https://github.com/kfazinic/graphql-git-loader/blob/main/schema.graphqls
   */
  const query = `
    query GetGraphQLSchemaForGraphQLtools($owner: String!, $name: String!, $expression: String!) {
      repository(owner: $owner, name: $name) {
        object(expression: $expression) {
          ... on Blob {
            text
          }
        }
      }
    }
  `
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: `bearer 09661d0678872f88266a36dd4a18ba20c4c56f55`,
    },
    body: JSON.stringify({
      query,
      variables: {
        owner,
        name,
        expression: ref + ':' + path,
      },
      operationName: 'GetGraphQLSchemaForGraphQLtools',
    }),
  })
  const responseJson = await response.json();
  const typeDefs = responseJson.data.repository.object.text;

  // -------------------------------------------------------------------------------------------------

  /**
   * SCHEMA TEST - tests if the schema gotten with GithubLoader is same as with fetch
   */
  const loader = new GithubLoader();
  const pointer = `github:${owner}/${name}#${ref}:${path}`;
  const schema = await loader.load(pointer, {
    token,
  });

  // Schema gotten using graphql-tools/github-loader
  const printedSchemaDoc = print(schema.document);

  // Schema built using the fetch request above
  const printedBuiltSchema = printSchema(buildSchema(typeDefs))

  expect(printedSchemaDoc).toEqual(printedBuiltSchema)


});
