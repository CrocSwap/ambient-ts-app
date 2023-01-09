import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useSidebarSearch = (): [
    Dispatch<SetStateAction<string>>
] => {
    const [rawInput, setRawInput] = useState<string>('');
    const [cleanInput, setCleanInput] = useState<string>('');
    false && cleanInput;

    useEffect(() => {
        const fixedInput = rawInput.trim().toLowerCase();
        setCleanInput(fixedInput);
    }, [rawInput]);

    return [
        setRawInput
    ];
}