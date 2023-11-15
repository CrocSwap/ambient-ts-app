import { TradeTableDataRow } from '../../types/TradeTableDataRow';
import { getAddress } from 'ethers/lib/utils.js';
import { fetchEnsAddresses } from '../../api/fetchENSAddresses';

type AddressCache = Map<string, string>; // <address, ens address>
type NullAddressCache = Map<string, number>; // <address, timestamp last fetched>

export const batchFetchAndCacheENSAddressData = async (
  data: TradeTableDataRow[],
  addressCache: AddressCache,
  nullAddressCache: NullAddressCache
) => {
  const DEADLINE = 1 * 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  const uniqueUserAddresses = Array.from(
    new Set(data.map((row) => (row.user ? getAddress(row.user) ?? '' : '').toLowerCase()))
  );

  const uncachedAddresses = uniqueUserAddresses.filter((addr) => {
    const nullTimestamp = nullAddressCache.get(addr);

    // Address is valid if it's not in the cache OR in the nullCache but was added more than DEADLINE ago
    return !!addr && !addressCache.has(addr) && (!nullTimestamp || now - nullTimestamp >= DEADLINE);
  });

  let batchedENSMap: Map<string, string> | null = null;

  const updatedAddressesCache = new Map();
  addressCache.forEach((value, key) => {
    updatedAddressesCache.set(key, value);
  });

  const updatedNullAddressesCache = new Map();
  nullAddressCache.forEach((value, key) => {
    updatedNullAddressesCache.set(key, value);
  });

  // If we have uncached addresses, we fetch them
  if (uncachedAddresses.length > 0) {
    batchedENSMap = await fetchEnsAddresses(uncachedAddresses);

    if (batchedENSMap && batchedENSMap.size > 0) {
      // Separate the addresses that returned null
      const nullAddresses: string[] = [];

      batchedENSMap.forEach((value, key) => {
        if (value === 'null') {
          nullAddresses.push(key.toLowerCase());
          batchedENSMap?.has(key) && batchedENSMap.delete(key);
        }
      });

      // Update nullCache with the addresses that returned null and current timestamp
      nullAddresses.forEach((addr) => updatedNullAddressesCache.set(addr, now));

      // Update the address cache with the newly fetched addresses
      batchedENSMap.forEach((value, key) => {
        updatedAddressesCache.set(key, value);
      });
    }
  }

  return { updatedAddressesCache, updatedNullAddressesCache };
};
