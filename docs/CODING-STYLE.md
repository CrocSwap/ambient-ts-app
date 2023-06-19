#### Coding Style Checklist

Please follow these items as close to as possible for your PR. Please add a description or link a Git issue for context. Check off relevant items and remove as not needed. These will help your reviewer find similar ground for starting their review from. 

#### Workflow Adherence
- [ ] Has an issue been created which this PR addresses?
- [ ] Has the PR been set to close relevant issues in GitHub?
- [ ] Did you pull code from branch `origin/develop` prior to submitting the PR?

#### Code Quality
- [ ] Does the code stick to our formatting and code standards?
- [ ] Are magic numbers declared in centralized `const` variables?
- [ ] Did you run Prettier before creating the PR?
  - [ ] Really? (Emily this means you)
- [ ] Do functions return a value through a single exit point?
- [ ] Does the app compile without errors or warnings?
- [ ] Has commented-out code been deleted or marked with a note to request preservation?
- [ ] Does error handling use `console.warn` or `console.error` for handled and unhandled exceptions, respectively? Does this logging reference the generating file?
- [ ] Have console commands been restricted with environmental variables (eg, dev environment only) as appropriate?

#### TypeScript
- [ ] Are all functions given a typed return?
- [ ] Are overloads used where a function has multiple possible return types?

#### JSX Files
- [ ] Do JSX files contain one and only one React functional component?
- [ ] Are props checked against an interface defined locally and declared as `propsIF`?
- [ ] Is each JSX file located in its own sub-directory?
- [ ] Do JSX files map 1:1 with related files? (eg CSS modules, test files, etc)
- [ ] Are React functional components declared as a default export?

#### Data Management
- [ ] Are data and relevant methods packaged together in objects?
- [ ] Are objects instantiated with class constructors when made in parallel?
- [ ] Are classes checked against an interface via the `implements` keyword?
- [ ] Is newly-written logic necessary due to a lack of centralized logic?
- [ ] Is every top-level code block explained with a comment?

#### Testing
- [ ] Are unit tests used where possible? In most cases, tests should be present for APIs, interfaces with data access, transformation, backend elements and models, with the Arrange/Act/Assert pattern and documentation.
