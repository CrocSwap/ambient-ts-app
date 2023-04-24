#### Coding Style Checklist

Please follow these items as close to as possible for your PR. Please add a description or link a Git issue for context. Check off relevant items and remove as not needed. These will help your reviewer find similar ground for starting their review from. 

- [ ] Does the code stick to our formatting and code standards? Does running prettier and ESLint over the code yield no warnings or errors?
- [ ] Are we using comments correctly? Use /* */ for block comments for new functions.
- [ ] Does this PR have a linked GitHub issue or a short description for context above?
- [ ] Does the change re-implement code that would be better served by pulling an existing module instead?
- [ ] Are we using instances of other classes where possible? 
- [ ] Does TypeScript code compile without raising linting errors?
- [ ] Instead of using raw strings, are constants used in the main class? Or if these strings are used across files/classes, is there a static class for the constants?
- [ ] Are magic numbers declared as constants with an explicit variable name explaining their purpose? 
- [ ] If there is an asynchronous method, does the name of the method end with the Async suffix?
- [ ] Is a minimum level of logging in place? Is the logging level is the right one?
- [ ] Are unit tests used where possible? In most cases, tests should be present for APIs, interfaces with data access, transformation, backend elements and models, with the Arrange/Act/Assert pattern and documentation.
- [ ] Checked against an interface via the implements keyword?
- [ ] Are component properties passed via useContext if the child component is deeply nested? (more than 2 levels)
