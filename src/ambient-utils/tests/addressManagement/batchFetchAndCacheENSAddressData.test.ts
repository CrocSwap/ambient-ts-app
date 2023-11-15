import { batchFetchAndCacheENSAddressData } from '../../src/dataLayer/addressManagement/batchFetchAndCacheENSAddressData';
import { fetchEnsAddresses } from '../../src/api/fetchENSAddresses';
import { getAddress } from 'ethers/lib/utils.js';
import { TradeTableDataRow } from '../../src/types';

jest.mock('../../src/api/fetchENSAddresses');
jest.mock('ethers/lib/utils.js');

describe('batchFetchAndCacheENSAddressData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getAddress as jest.Mock).mockImplementation((addr) => addr.toLowerCase());
    });

    it('should not fetch when there are no uncached addresses', async () => {
        const data: TradeTableDataRow[] = [];
        const addressCache = new Map();
        const nullAddressCache = new Map();
        
        const result = await batchFetchAndCacheENSAddressData(data, addressCache, nullAddressCache);
        
        expect(fetchEnsAddresses).not.toHaveBeenCalled();
        expect(result.updatedAddressesCache.size).toBe(0);
        expect(result.updatedNullAddressesCache.size).toBe(0);
    });

    it('should not fetch when all addresses are cached', async () => {
        const data: Partial<TradeTableDataRow>[] = [{ user: '0xSomeAddress1' }, { user: '0xSomeAddress2' }];
        const addressCache = new Map([
            ['0xsomeaddress1', 'name1.eth'],
            ['0xsomeaddress2', 'name2.eth'],
        ]);

        const nullAddressCache = new Map();
        
        const result = await batchFetchAndCacheENSAddressData(data as TradeTableDataRow[], addressCache, nullAddressCache);
        
        expect(fetchEnsAddresses).not.toHaveBeenCalled();
        expect(result.updatedAddressesCache.size).toBe(2);
    });

    it('should fetch when addresses are not in cache', async () => {
        const data: Partial<TradeTableDataRow>[] = [{ user: '0xSomeAddress3' }, { user: '0xSomeAddress4' }];
        const addressCache = new Map([['0xsomeaddress4', 'name4.eth']]);
        const nullAddressCache = new Map();

        (fetchEnsAddresses as jest.Mock).mockResolvedValueOnce(new Map([
            ['0xsomeaddress3', 'name3.eth'],
        ]));
        
        const result = await batchFetchAndCacheENSAddressData(data as TradeTableDataRow[], addressCache, nullAddressCache);
        
        expect(fetchEnsAddresses).toHaveBeenCalledWith(['0xsomeaddress3']);
        expect(result.updatedAddressesCache.size).toBe(2);
        expect(result.updatedAddressesCache.get('0xsomeaddress3')).toBe('name3.eth');
        expect(result.updatedAddressesCache.get('0xsomeaddress4')).toBe('name4.eth');
    });

    it('should handle addresses that returned null correctly', async () => {
        const data: Partial<TradeTableDataRow>[] = [{ user: '0xSomeAddress5' }];
        const addressCache = new Map();
        const nullAddressCache = new Map();

        (fetchEnsAddresses as jest.Mock).mockResolvedValueOnce(new Map([
            ['0xSomeAddress5', 'null'],
        ]));
        
        const result = await batchFetchAndCacheENSAddressData(data as TradeTableDataRow[], addressCache, nullAddressCache);
        
        expect(result.updatedAddressesCache.has('0xsomesddress5')).toBeFalsy();
        expect(result.updatedNullAddressesCache.has('0xsomeaddress5')).toBeTruthy();
    });
});
