export default function matchSearchInput(
    // search input from user
    searchInput: string,
    // array of strings to check user input against
    matchValues: string[],
    // optional arg to force exact matches only
    exact = false,
): boolean {
    // case-fixed versions of parameters
    const fixedInput: string = searchInput.toLowerCase();
    const fixedMatches: string[] = matchValues.map((val: string) =>
        val.toLowerCase(),
    );
    // fn to find exact matches to search input
    function findExactMatch(input: string): boolean {
        return fixedMatches.some((val: string) => val === input);
    }
    // fn to find partial matches to search input
    function findPartialMatch(input: string): boolean {
        return fixedMatches.some((val: string) => val.includes(input));
    }
    // logic router to return only exact matches or also partial matches
    const isMatch: boolean =
        exact || fixedInput.length === 2
            ? findExactMatch(fixedInput)
            : findPartialMatch(fixedInput);
    // return boolean indicating if a match was found
    return isMatch;
}
