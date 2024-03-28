import { useMemo, useState } from 'react';

export type skins = 'purple_dark' | 'purple_light' | 'orange';

export interface skinMethodsIF {
    colors: Record<string, unknown>;
    choosePurpleDark: () => void;
    choosePurpleLight: () => void;
}

export const useSkin = (defaultSkin: string): skinMethodsIF => {
    const LS_KEY = 'skin';

    // name of the current skin in use by the app
    // defaults to value in local storage, uses value from params as fallback
    const [skin, setSkin] = useState<string>(
        localStorage[LS_KEY] ?? defaultSkin,
    );

    // hook to hold a single color set for the app to return
    // updates local storage when needed as an accessory function
    const colors = useMemo(() => {
        localStorage.setItem('skin', skin);
        return {};
    }, [skin]);

    return useMemo(
        () => ({
            colors,
            choosePurpleDark: () => setSkin('purple_dark'),
            choosePurpleLight: () => setSkin('purple_light'),
        }),
        [colors],
    );
};
