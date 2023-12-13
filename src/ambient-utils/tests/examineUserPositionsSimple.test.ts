import { fetchRecords } from '../api/fetchUserPositions';
import tokenUniverseData from '../testing-only-ambient-token-list.json';
import { PositionIF, LimitOrderIF } from '../types';
// TransactionIF
describe('Test fetchUserPositions Simple', () => {
    jest.setTimeout(10000); // Set timeout to 10000 ms (10 seconds)
    describe('userPositions', () => {
        test('ensure some positions exist', async () => {
            if (
                !process.env.NETWORK_ACCESS ||
                process.env.NETWORK_ACCESS === 'false'
            ) {
                console.log('skipping');
                return;
            }
            const userAddress = '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1';
            const chainId = '0x1';
            const tokenUniv = tokenUniverseData.tokens;

            const userPositions = await fetchRecords({
                recordType: PositionIF,
                user: userAddress,
                chainId: chainId,
                tokenUniv: tokenUniv,
            });
            console.log(userPositions);
            expect(userPositions.length).toBeGreaterThan(0);
        });
    });
});
