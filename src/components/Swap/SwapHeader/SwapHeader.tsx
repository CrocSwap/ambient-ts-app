// START: Import React and Dongles

// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import { useModal } from '../../../components/Global/Modal/useModal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import { SlippagePairIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';

// interface for props
interface SwapHeaderPropsIF {
    chainId: string;
    tokenPair: TokenPairIF;
    swapSlippage: SlippagePairIF;
    isOnTradeRoute?: boolean;
    isDenomBase: boolean;
    isTokenABase: boolean;
}

// main react functional component
export default function SwapHeader(props: SwapHeaderPropsIF) {
    const { chainId, tokenPair, swapSlippage, isOnTradeRoute, isDenomBase, isTokenABase } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const reverseDisplay = (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                chainId={chainId}
                module={isOnTradeRoute ? 'Market Order' : 'Swap'}
                tokenPair={tokenPair}
                slippage={swapSlippage}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {reverseDisplay ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {reverseDisplay ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
            <div onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <div />
            <span className={styles.title}>Swap</span>
            <div className={styles.settings_container} onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
        </ContentHeader>
    );

    return (
        <>
            {isOnTradeRoute ? tradeRouteHeader : mainHeader}
            {settingsModalOrNull}
        </>
    );
}
