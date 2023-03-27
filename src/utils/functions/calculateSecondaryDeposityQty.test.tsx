import { calculateSecondaryDepositQty } from './calculateSecondaryDepositQty';
// import * as sdk from '@crocswap-libs/sdk';
// const mockToDisplayPrice = jest.fn();

jest.mock('@crocswap-libs/sdk', () => ({
    toDisplayPrice: () => 0.0005809534616770911,
}));

// import service from './Service';
// jest.mock('@crocswap-libs/sdk', () => jest.fn());
// sdk.toDisplayPrice = jest.fn(() => { /*your mock*/ })

const TEST_PRECISION = 4;
const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;

describe('verify calculateSecondaryDepositQty output', () => {
    it.each([
        // // 1 USDC to 0.000603 eth: http://localhost:3000/trade/range/chain=0x5&tokenA=0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C&tokenB=0x0000000000000000000000000000000000000000
        // 580953461.6770911, // poolPriceNonDisplay: number, // the 'scaled' or 'wei' price of the pool
        // 6, // tokenADecimals: number,
        // 18, // tokenBDecimals: number,
        // '1', // primaryInputValueStr: string, // the token quantity entered by the user
        // true, // isTokenAPrimary: boolean,
        // false, // isTokenABase: boolean,
        // false, // isAmbientPosition: boolean,
        // 1.038616454647909, // depositSkew?: number,
        // 0.000603,

        [
            580953461.6770911,
            USDC_DECIMALS,
            ETH_DECIMALS,
            '100',
            true,
            false,
            false,
            1.038616454647909,
            0.060338782468249,
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
            expected,
        ) => {
            // sdk.toDisplayPrice.mockImplementation(() => 0.0005809534616770911);
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
            expect(expected).toBeCloseTo(qtyTokenB || -1, TEST_PRECISION);
        },
    );
});
