import { useEffect, useState } from 'react';

export const useSkin = (defaultSkin: string) => {
    const [skin, setSkin] = useState<string>(localStorage.skin ?? defaultSkin);
    useEffect(() => {
        localStorage.setItem('skin', skin);
    }, [skin]);
    return {
        choosePurpleDark: () => setSkin('purple_dark'),
        choosePurpleLight: () => setSkin('purple_light')
    };
}