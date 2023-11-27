import { fetchBatch } from '../../utils/functions/fetchBatch';

/* eslint-disable camelcase */
export async function fetchENSAddress(address: string) {
    try {
        const body = { config_path: 'ens_address', address: address };
        const { ens_address } = await fetchBatch<'ens_address'>(body);
        return ens_address;
    } catch (error) {
        return null;
    }
}
