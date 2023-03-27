import { calculateSecondaryDepositQty } from './calculateSecondaryDepositQty';

const WBTC_DECIMALS = 8;
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;

describe('verify calculateSecondaryDepositQty output', () => {
    it.each([
        [
            // 1 USDC yielding 0.000603 eth
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
            // 100 USDC yielding 0.0603 eth
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
            // 0.00001 USDC yielding a small amount of ETH, with updated pool value
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
            // 1000 USDC to ~0.5 ETH, 52% Range Width
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
            // 1000 USDC to ~0.5 ETH, 12% Range Width
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
            // 1 ETH to ~1600 USDC, with updated pool value
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
            // 10 WBTC to , with updated pool value
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
    ])(
        'input: %s',
        (
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
