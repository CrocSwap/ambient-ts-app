import React from 'react';
import TokenDetailsHeader from './TokenDetailsHeader/TokenDetailsHeader';
import { FlexContainer } from '../../../styled/Common';
import styles from './TokenDetails.module.css';
import DetailsContent from './DetailItems/DetailsContent';
export default function TokenDetails() {
    return (
        <div className={styles.container}>
            <TokenDetailsHeader />
            <DetailsContent />
        </div>
    );
}
