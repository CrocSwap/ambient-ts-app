import { calculateSecondaryDepositQty } from './calculateSecondaryDepositQty';

const WBTC_DECIMALS = 8;
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;

describe('testing calculateSecondaryDepositQty', () => {
    it.each([
        [
            'Balanced 1 ETH-USDC Mint at ±10% Width',
            580953461.6770911, // poolPriceNonDisplay: number, 'scaled' or 'wei' price of the pool
            6, // tokenADecimals: number,
            18, // tokenBDecimals: number,
            '1', // primaryInputValueStr: string, the token quantity entered by the user
            true, // isTokenAPrimary: boolean,
            false, // isTokenABase: boolean,
            false, // isAmbientPosition: boolean,
            1.038616454647909, // depositSkew?: number,
            0.0005809534616770911, // mocked @crocswap-libs/sdk.toDisplayPrice return value.
            0.000603, // expected value.
            6, // precision for comparison of default vlaue.
        ],
        [
            'Balanced 100 USDC-ETH Mint at ±10% Width',
            580953461.6770911,
            USDC_DECIMALS,
            ETH_DECIMALS,
            '100',
            true,
            false,
            false,
            1.038616454647909,
            0.0005809534616770911,
            0.060338782468249,
            15,
        ],
        [
            'Balanced 0.00001 USDC-ETH Mint at ±10% Width',
            585685851.9804151,
            USDC_DECIMALS,
            ETH_DECIMALS,
            '0.00001',
            true,
            false,
            false,
            1.0093300287442797,
            0.0005856858519804151,
            5.911503178145104e-9,
            15,
        ],
        [
            'Balanced 1000 USDC-ETH Mint at ±52% Width',
            585685851.9804151,
            USDC_DECIMALS,
            ETH_DECIMALS,
            '1000',
            true,
            false,
            false,
            1.0016912625001917,
            0.0005856858519804151,
            0.5866764004987624,
            15,
        ],
        [
            'Balanced 1000 USDC-ETH Mint at ±12% Width',
            585685851.9804151,
            USDC_DECIMALS,
            ETH_DECIMALS,
            '1000',
            true,
            false,
            false,
            1.007850691212829,
            0.0005856858519804151,
            0.5902838907520361,
            15,
        ],
        [
            'Balanced 1000 USDC-ETH Mint at ±10% Width',
            580949046.2755661,
            ETH_DECIMALS,
            USDC_DECIMALS,
            '1',
            true,
            true,
            false,
            1.0384661373603,
            0.000580949046275566,
            1657.561372390969,
            15,
        ],
        [
            'Balanced 10 WBTC-ETH Mint at ±10% Width',
            157556275070.23358,
            WBTC_DECIMALS,
            ETH_DECIMALS,
            '10',
            true,
            false,
            false,
            0.976255942594625,
            15.755627507023359,
            153.8152498303889,
            15,
        ],

        [
            'Balanced 10 WBTC-ETH Mint at Ambient Width',
            157556275070.23358,
            WBTC_DECIMALS,
            ETH_DECIMALS,
            '10',
            true,
            false,
            true,
            1,
            15.755627507023359,
            157.5562750702336,
            15,
        ],

        [
            'Balanced 15.3 WBTC-ETH Mint, non-base token',
            157556275070.23358,
            WBTC_DECIMALS,
            ETH_DECIMALS,
            '15.3',
            false,
            false,
            false,
            0.976255942594625,
            15.755627507023359,
            0.9946998114212481,
            15,
        ],

        [
            'Balanced 1 ETH-WBTC Mint, non-base token',
            157556275070.23358,
            ETH_DECIMALS,
            WBTC_DECIMALS,
            '1',
            true,
            true,
            true,
            1,
            15.755627507023359,
            0.06346938575148668,
            15,
        ],
    ])(
        'testing case: %s',
        (
            _,
            poolPriceNonDisplay,
            tokenADecimals,
            tokenBDecimals,
            primaryInputValueStr,
            isTokenAPrimary,
            isTokenABase,
            isAmbientPosition,
            depositSkew,
            mockToDisplayPrice,
            expected,
            precision,
        ) => {
            // NOTE: I wanted to do the mock once, but I was running into issues with mockImplementation and our sdk.
            jest.mock('@crocswap-libs/sdk', () => ({
                toDisplayPrice: () => mockToDisplayPrice,
            }));
            const qtyTokenB = calculateSecondaryDepositQty(
                poolPriceNonDisplay,
                tokenADecimals,
                tokenBDecimals,
                primaryInputValueStr,
                isTokenAPrimary,
                isTokenABase,
                isAmbientPosition,
                depositSkew,
            );
            expect(qtyTokenB).toBeDefined();
            expect(qtyTokenB || -1).toBeCloseTo(expected, precision);
        },
    );
});
