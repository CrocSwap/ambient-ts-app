export let AMBIENT_UTILS_OVERRIDES = {
    INFURA_API_KEY: '',
    ETHERSCAN_API_KEY: '',
};

export function initPackage(externalOverrides: { [key: string]: string }) {
    AMBIENT_UTILS_OVERRIDES = {
        ...AMBIENT_UTILS_OVERRIDES,
        ...externalOverrides,
    };
}
