import React from 'react';
import TokenDetailsHeader from './TokenDetailsHeader/TokenDetailsHeader';
import { FlexContainer } from '../../../styled/Common';
import styles from './TokenDetails.module.css';
export default function TokenDetails() {
    return (
        <div className={styles.container}>
            <TokenDetailsHeader />
            <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Officia, tempora labore assumenda laborum recusandae fuga quas.
                Rem modi fugit tempore odit, nesciunt voluptatum ad cumque
                dignissimos dolorem similique quidem sapiente quam qui saepe
                pariatur omnis? Modi, perspiciatis eaque! Beatae, expedita.
            </p>
        </div>
    );
}
