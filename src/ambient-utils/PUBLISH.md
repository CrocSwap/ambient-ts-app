# 🛠🐊🛠 The data layer/utilities of the Ambient Frontend.

## Link

### https://www.npmjs.com/package/@crocswap-libs/ambient-utils

## Publishing

### Prerequisites

1. Ensure you're logged in to the `@crocswap-libs` npm account.

```
$ npm login
Username: (your username)
Password: (your password)
Email: (your email address)
```

2. Ensure `ambient-utils/package.json` contains all dependencies used within the folder to work independently.

3. Ensure the versions of all dependencies listed in `ambient-utils/package.json` match the ones in the frontend's `package.json`.

4. Ensure you have permissions to run the publishing file `scripts/publish-ambient-utils.js`. 
```
$ chmod +x scripts/publish-ambient-utils.js
```

### Steps

1. Make the appropriate changes to `ambient-utils/package.json` including versioning, packages, licensing.

2. Publish the package by running `yarn publish-ambient-utils`. This will compile and publish ambient-utils. NOTE: By default, this will do a dry-run. Pass in the `--publish` flag to actually run the publishing script.

## FAQ

#### 1. When using `ambient-utils` within the frontend, will separate dependencies need to be installed for it during development?
No. Separate dependencies will only get installed if `yarn install` or `npm install` is explicitly run in the `ambient-utils` directory. There is no need to do this as ambient-utils relies on using the packages specified in the root `package.json` and installed in the root `node_modules` directory as part of the frontend app.

#### 2. Will `ambient-utils/package.json` require manual maintainance?
Yes. Any change in dependencies and versioning will have to be manually kept in-sync from the frontend's `package.json` to `ambient-utils/package.json`. There are ways to automate this and may be worth considering in the future i.e. yarn worksapces, git submodules, etc.

#### 3. Will I need to import ambient-utils as a local package to use it in development?
No. The `ambient-utils` directory will be treated as just another folder in the frontend app. However, if a published version exists, you technically are able to install and use `@crcoswap-libs/ambient-utils` as a npm package and get access to the same exports.
