import { useMemo, useState } from 'react';

// TODO:   @Junior  this is the file we'll use to manage the current color
// TODO:   @Junior  ... theme in the app, the useMemo() hook should be able
// TODO:   @Junior  ... to read the current value of `skin` & return the
// TODO:   @Junior  ... correct JSON color set

export interface skinMethodsIF {
    colors: Record<string, unknown>;
    choosePurpleDark: () => void;
    choosePurpleLight: () => void;
}

export const useSkin = (defaultSkin: string): skinMethodsIF => {
    // name of the current skin in use by the app
    // defaults to value in local storage, uses value from params as fallback
    const [skin, setSkin] = useState<string>(localStorage.skin ?? defaultSkin);

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
