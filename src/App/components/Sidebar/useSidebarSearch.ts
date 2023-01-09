import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useSidebarSearch = (): [
    Dispatch<SetStateAction<string>>
] => {
    const [rawInput, setRawInput] = useState<string>('');
    useEffect(() => console.log({rawInput}), [rawInput]);

    return [
        setRawInput
    ];
}