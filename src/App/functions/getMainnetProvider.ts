import { ethers } from 'ethers';
import { IS_LOCAL_ENV } from '../../constants';

export const getMainnetProvider = () => {
    const infuraKey2 = process.env.REACT_APP_INFURA_KEY_2
        ? process.env.REACT_APP_INFURA_KEY_2
        : '360ea5fda45b4a22883de8522ebd639e'; // croc labs #2

    const mainnetProvider = new ethers.providers.JsonRpcProvider(
        'https://mainnet.infura.io/v3/' + infuraKey2, // croc labs #2
    );
    IS_LOCAL_ENV && console.debug({ mainnetProvider });
    return mainnetProvider;
};
