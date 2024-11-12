// START: Import React and Dongles
import { memo } from 'react';

import styles from './Vaults.module.css';
import VaultRow from './VaultRow/VaultRow';

function Vaults() {
    const vaultData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <div data-testid={'portfolio'} className={styles.container}>
            {vaultData.map((data, idx) => (
                <VaultRow key={idx} />
            ))}
        </div>
    );
}

export default memo(Vaults);
