### Pull Request Checklist

Please follow these items as close to as possible for your PR. Check off relevant items and remove as not needed. These will help your reviewer find similar ground for starting their review from. 

- [ ] Does the code stick to our formatting and code standards? Does running prettier and ESLint over the code should yield no warnings or errors respectively?
- [ ] Are we using comments correctly? Use /* */ for block comments for new functions. 
- [ ] Does the change re-implement code that would be better served by pulling an existing module instead?
- [ ] Does TypeScript code compile without raising linting errors?
- [ ] Instead of using raw strings, are constants used in the main class? Or if these strings are used across files/classes, is there a static class for the constants?
- [ ] Are magic numbers explained? There should be no number in the code without at least a comment of why it is there. If the number is repetitive, is there a constant/enum or equivalent?
- [ ] Are unit tests used where possible? In most cases, tests should be present for APIs, interfaces with data access, transformation, backend elements and models. 
- [ ] Are tests arranged correctly with the Arrange/Act/Assert pattern and properly documented in this way?
- [ ] If there is an asynchronous method, does the name of the method end with the Async suffix?
- [ ] Is a minimum level of logging in place? Is the logging level is the right one?
- [ ] Are heavy operations implemented in the backend, leaving the controller as thin as possible?
- [ ] Is event handling on the html efficiently done?
