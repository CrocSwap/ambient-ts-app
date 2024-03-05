run `yarn` to install dependencies
run `npx playwright install` to install playwright browser for testing

run `npx playwright test` to run all tests

To run just the headed test with a test wallet
run `npx playwright test swap.test.ts` for running init wallet and swapping tests

IMPORTANT

in your .env.local file you should add seed words that will be used for injecting metamask into your playwright test context

here is a sample seed word set that you can use

TEST_METAMASK_SEED=rally,increase,illegal,clean,noodle,observe,knife,welcome,hundred,garlic,stove,clap
