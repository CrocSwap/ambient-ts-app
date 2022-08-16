export default function formatSearchText(input: string) {
    //  format input as an array of single-character strings
    const inputAsArray = input.toLowerCase().split('');
    //  recognized separator characters
    const separators = [' ', '/', '\\', ','];

    // remove any leading separator characters including whitespace
    while (separators.includes(inputAsArray[0])) inputAsArray.shift();

    // array to hold isolated strings to be searched
    const outputArray: string[] = [];
    // value to accumulate strings before being pushed to `outputArray`
    let builtString = '';

    const pushAndResetString = () => {
        // if character is a separator, push current value of builtString to output
        builtString.length && outputArray.push(builtString);
        // reset value of builtString
        builtString = '';
    };

    while (inputAsArray.length && outputArray.length < 2) {
        // remove first character from array (mutated) and hold in a variable
        const character = inputAsArray.shift();
        // accumulate character or break if it is a separator
        separators.includes(character as string)
            ? pushAndResetString()
            : (builtString += character);
    }

    // add second search string to the output array if there is one
    pushAndResetString();

    // format output array of raw strings into tuples
    const outputTuples = outputArray.map((searchText: string) => [
        searchText.startsWith('0x') ? 'address' : 'name',
        searchText,
    ]);

    // log searches in console
    console.log(outputTuples);

    return outputTuples;
}
