import { fetchRecords } from '../../api';
import { RecordType } from '../../types';
import { isNetworkAccessDisabled } from '../config';

describe('Test fetchUserPositions Simple', () => {
    jest.setTimeout(40000);
    describe('userPositions', () => {
        if (isNetworkAccessDisabled()) {
            it.skip('Skipping test due to lack of network access', () => {});
        } else {
            it('ensure some positions exist', async () => {
                if (isNetworkAccessDisabled()) {
                    console.log('skipping');
                    return;
                }
                const userChains = [
                    {
                        userAddress:
                            '0x648a62958D11Ea1De1F73ff3F5ecb9FBEE1bBa01',
                        chainId: '0x5',
                    },
                    {
                        userAddress:
                            '0xfd3fa9d94eeb4e9889e60e37d0f1fe24ec59f7e1',
                        chainId: '0x1',
                    },
                ];
                const recordTypes = [
                    RecordType.Position,
                    RecordType.LimitOrder,
                ];

                for (const userChain of userChains) {
                    for (const recordType of recordTypes) {
                        const userRecords = await fetchRecords({
                            recordType: recordType,
                            user: userChain.userAddress,
                            chainId: userChain.chainId,
                        });
                        expect(userRecords.length).toBeGreaterThan(0);
                    }
                }
            });
        }
    });
});
