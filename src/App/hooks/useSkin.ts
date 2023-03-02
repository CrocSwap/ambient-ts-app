import { useMemo, useState } from 'react';

export const useSkin = (defaultSkin: string) => {
    const [skin, setSkin] = useState<string>(localStorage.skin ?? defaultSkin);
    const colors = useMemo(() => {
        localStorage.setItem('skin', skin);
        return {};
    }, [skin]);
    return {
        colors,
        choosePurpleDark: () => setSkin('purple_dark'),
        choosePurpleLight: () => setSkin('purple_light')
    };
}