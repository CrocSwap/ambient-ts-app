import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useSidebarSearch = (): [
    Dispatch<SetStateAction<string>>
] => {
    // raw user input from the DOM
    const [rawInput, setRawInput] = useState<string>('');
    // sanitized version of DOM input
    const [cleanInput, setCleanInput] = useState<string>('');
    // make the linter happy until I use this value
    false && cleanInput;

    // run logic to sanitize raw input every time it changes
    useEffect(() => {
        // trim outer whitespace and convert to lower case
        const fixedInput = rawInput.trim().toLowerCase();
        // send sanitized input to local state
        setCleanInput(fixedInput);
    }, [rawInput]);

    return [
        setRawInput
    ];
}