# Ambient Testing Suite 
This testing suite is split up into two categories - <b>unit tests</b> and <b>integration tests</b>.

## Running the Tests

### Unit tests
Offline, independent, tests meant to test commonly used stateless functions. These tests can be run by running either of the following command(s):
```
# By default, only unit tests are run
yarn test
```
```
yarn test:unit
```


### Integration tests
These tests are a compromise between unit and fully-fledged integration tests. The idea was to use Jest to highlight and test critical app functionality like fetching user positions and performing trades without having to rely on DOM interactions. These tests some environment variables to run and can be found in `.env.test.sample`. Most of these values do have fallbacks but some must be provided i.e. `PROVIDER_KEY`.
```
yarn test:integration
```

## FAQ
