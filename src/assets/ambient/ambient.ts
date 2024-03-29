import { skins } from '../../App/hooks/useSkin';

interface brandAssetsIF {
    color: { [key: string]: skins };
    platformName: string;
}

export const ambient: brandAssetsIF = {
    color: {
        '0x1': 'purple_dark',
        '0x82750': 'purple_dark',
        '0x5': 'purple_dark',
        '0x8274f': 'purple_dark',
        '0x13e31': 'purple_dark',
    },
    platformName: 'ambient',
};
