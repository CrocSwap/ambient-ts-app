// import React, { useState } from 'react';
// import Medal from '../../components/Global/Medal/Medal';
// import { MenuButton } from '../../components/Global/MenuButton/MenuButton';
// import PulseLoading from '../../components/Global/PulseLoading/PulseLoading';
import styles from './TestPage.module.css';
// import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
// import { Steps, Hints } from 'intro.js-react';
import 'intro.js/introjs.css';
import { tosMethodsIF } from '../../App/hooks/useTermsOfService';
import { chartSettingsMethodsIF } from '../../App/hooks/useChartSettings';

interface TestPageProps {
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    togggggggleSidebar: () => void;
    walletToS: tosMethodsIF;
    chartSettings: chartSettingsMethodsIF;
}
// eslint-disable-next-line
export default function TestPage(props: TestPageProps) {
    const { walletToS } = props;

    return (
        <section className={styles.main}>
            <p>
                {walletToS.isAgreed
                    ? `You agreed to ToS on ${walletToS.lastAgreement?.acceptedOn}`
                    : 'Please agree to our ToS'}
            </p>
            {!walletToS.isAgreed && (
                <button onClick={() => walletToS.acceptToS()}>
                    Accept the ToS!
                </button>
            )}
        </section>
    );
}
