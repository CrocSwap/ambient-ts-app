import { ReactNode, createContext, useContext, useMemo, useState } from 'react';
import { skins } from '../App/hooks/useSkin';
import { brandIF, fontSets, heroItem } from '../assets/branding/types';
import { TradeDataContext } from './TradeDataContext';
import { chainIds } from '../ambient-utils/types';
import {
    blastBrandAssets,
    scrollBrandAssets,
    defaultBrandAssets,
    ambientProductionBrandAssets,
    ambientTestnetBrandAssets,
    futaBrandAssets,
} from '../assets/branding';
import { UserDataContext } from './UserDataContext';

const PREMIUM_THEMES_IN_ENV = {
    theme1: 'VITE_THEME_1_ACCOUNTS',
    theme2: 'VITE_THEME_2_ACCOUNTS',
};

type premiumThemes = keyof typeof PREMIUM_THEMES_IN_ENV;

export interface BrandContextIF {
    skin: {
        active: skins,
        set: (s: skins) => void,
    };
    fontSet: fontSets;
    colorAndFont: string;
    platformName: string;
    networks: chainIds[];
    headerImage: string;
    showPoints: boolean;
    showDexStats: boolean;
    hero: heroItem[];
    premium: Record<premiumThemes, boolean>;
    includeCanto: boolean;
}

export const BrandContext = createContext<BrandContextIF>({} as BrandContextIF);

export const BrandContextProvider = (props: { children: ReactNode }) => {
    const { userAddress } = useContext(UserDataContext);
    const { chainData } = useContext(TradeDataContext);

    // brand asset set to consume as specified in environmental variable
    // can also provide a fallback if a custom brand is missing values

    const premiumAccess = useMemo<Map<premiumThemes, boolean>>(() => {
        const hasPremium = new Map<premiumThemes, boolean>();
        Object.entries(PREMIUM_THEMES_IN_ENV).forEach((themeMeta) => {
            const [themeName, envKey] = themeMeta;
            const raw: string | undefined = process.env[envKey];
            if (raw) {
                const addresses: string[] = raw.split(',');
                hasPremium.set(
                    themeName as premiumThemes,
                    userAddress ? addresses.includes(userAddress) : false,
                );
            }
        });
        return hasPremium;
    }, [userAddress]);

    // TODO: add error handling if dev puts a value in `.env` not matching defined cases
    const brand: string = import.meta.env.VITE_BRAND_ASSET_SET ?? '';
    const brandAssets = useMemo<brandIF>(() => {
        switch (brand) {
            case 'blast':
                return blastBrandAssets;
            case 'scroll':
                return scrollBrandAssets;
            case 'futa':
                return futaBrandAssets;
            case 'ambientProduction':
                return ambientProductionBrandAssets;
            case 'ambientTestnet':
                return ambientTestnetBrandAssets;
            default:
                return defaultBrandAssets;
        }
    }, [brand]);

    const [skin, setSkin] = useState<skins>(getDefaultSkin());

    function getDefaultSkin(): skins {
        const networkSettings = brandAssets.networks[chainData.chainId as chainIds];
        const defaultSkin: skins = networkSettings?.color[0] ?? 'purple_dark';
        return defaultSkin;
    }

    function getHero(): heroItem[] {
        const networkPrefs =
            brandAssets.networks[chainData.chainId as chainIds];
        return networkPrefs
            ? networkPrefs.hero
            : [{ content: 'ambient', processAs: 'separator' }];
    }

    // data to be returned to the app
    const brandData: BrandContextIF = {
        skin: {
            active: skin,
            set: (s: skins) => setSkin(s),
        },
        fontSet: brandAssets.fontSet,
        colorAndFont: getDefaultSkin() + '+' + brandAssets.fontSet,
        platformName: brandAssets.platformName,
        networks: Object.keys(brandAssets.networks) as chainIds[],
        headerImage: brandAssets.headerImage,
        showPoints: brandAssets.showPoints,
        showDexStats: brandAssets.showDexStats,
        hero: getHero(),
        premium: {
            theme1: premiumAccess.get('theme1') as boolean,
            theme2: premiumAccess.get('theme2') as boolean,
        },
        includeCanto: brandAssets.includeCanto,
    };

    return (
        <BrandContext.Provider value={brandData}>
            {props.children}
        </BrandContext.Provider>
    );
};
