// START: Import React Functional Components
import Modal from '../../../components/Global/Modal/Modal';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import { useModal } from '../../../components/Global/Modal/useModal';
import settingsIcon from '../../../assets/images/icons/settings.svg';
import { SlippagePairIF } from '../../../utils/interfaces/exports';
import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';

// interface for props
interface SwapHeaderPropsIF {
    // tokenPair: TokenPairIF;
    swapSlippage: SlippagePairIF;
    isPairStable: boolean;
    isOnTradeRoute?: boolean;
    // isDenomBase: boolean;
    // isTokenABase: boolean;
}

// main react functional component
export default function SwapHeader(props: SwapHeaderPropsIF) {
    const { swapSlippage, isPairStable, isOnTradeRoute } = props;
    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;

    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module={isOnTradeRoute ? 'Market Order' : 'Swap'}
                slippage={swapSlippage}
                isPairStable={isPairStable}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
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
