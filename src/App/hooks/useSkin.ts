import { useState } from 'react';

export const useSkin = (defaultSkin: string) => {
    const [skin, setSkin] = useState<string>(localStorage.skin ?? defaultSkin);
    console.log({skin});
    false && setSkin;
}