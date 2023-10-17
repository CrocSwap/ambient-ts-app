import {
    memo,
    // useContext
} from 'react';

import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';
// import { CrocEnvContext } from '../../contexts/CrocEnvContext';
// import { TokenContext } from '../../contexts/TokenContext';
// import { useUrlParams } from '../../utils/hooks/useUrlParams';

function Swap() {
    // TODO:  turn this machinery back on part & parcel with refactor to chain switching
    // const {
    //     chainData: { chainId },
    //     provider,
    // } = useContext(CrocEnvContext);
    // const { tokens } = useContext(TokenContext);
    // useUrlParams(tokens, chainId, provider);

    return (
        <div className={styles.swap_page_container}>{<SwapComponent />}</div>
    );
}

export default memo(Swap);
