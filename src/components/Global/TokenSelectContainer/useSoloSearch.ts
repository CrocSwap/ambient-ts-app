import { useEffect, useState } from 'react';

export const useSoloSearch = () => {
    console.log('Hi mom!');
    const [text, setText] = useState('');
    useEffect(() => console.log(text), [text]);
    return [setText];
}