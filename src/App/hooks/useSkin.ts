import { useEffect, useMemo, useState } from 'react';

export type skins = 'purple_dark' | 'purple_light' | 'orange';

export interface skinMethodsIF {
    active: skins;
    changeTo: (s: skins) => void;
}

export const useSkin = (defaultSkin: skins): skinMethodsIF => {
    const LS_KEY = 'skin';

    const CHAIN_DEFAULT_SKINS: { [key: string]: skins } = {
        '0x1': 'purple_dark',
        '0x13e31': 'orange',
    };

    const skinsByChain = new Map<string, skins>();

    Object.entries(CHAIN_DEFAULT_SKINS).forEach((def: [string, skins]) => {
        const [chn, skin] = def;
        skinsByChain.has(chn) || skinsByChain.set(chn, skin);
    });

    // name of the current skin in use by the app
    // defaults to value in local storage, uses value from params as fallback
    const [skin, setSkin] = useState<skins>(
        localStorage[LS_KEY] ?? defaultSkin,
    );

    // hook to hold a single color set for the app to return
    // updates local storage when needed as an accessory function
    useEffect(() => {
        localStorage.setItem(LS_KEY, skin);
    }, [skin]);

    return useMemo(
        () => ({
            active: skin,
            changeTo: (s: skins) => setSkin(s),
        }),
        [skin],
    );
};
