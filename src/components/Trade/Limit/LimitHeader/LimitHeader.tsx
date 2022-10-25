// START: Import React and Dongles

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './LimitHeader.module.css';
import { SlippagePairIF } from '../../../../utils/interfaces/exports';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { useAppDispatch, useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import { AiOutlineShareAlt } from 'react-icons/ai';

// interface for component props
interface LimitHeaderPropsIF {
    chainId: string;
    // tokenPair: TokenPairIF;
    mintSlippage: SlippagePairIF;
    isPairStable: boolean;

    openGlobalModal: (content: React.ReactNode, title?: string) => void;

    shareOptionsDisplay: JSX.Element;
    // isDenomBase: boolean;
    // isTokenABase: boolean;
}

// central react functional component
export default function LimitHeader(props: LimitHeaderPropsIF) {
    const { mintSlippage, isPairStable, openGlobalModal } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();
    const tradeData = useAppSelector((state) => state.tradeData);
    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;
    // const reverseDisplay = (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                module='Limit Order'
                slippage={mintSlippage}
                isPairStable={isPairStable}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    return (
        <ContentHeader>
            <div
                className={styles.share_button}
                onClick={() => openGlobalModal(props.shareOptionsDisplay, 'Share')}
            >
                <AiOutlineShareAlt />
            </div>
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {isDenomBase ? baseTokenSymbol : quoteTokenSymbol} /{' '}
                {isDenomBase ? quoteTokenSymbol : baseTokenSymbol}
            </div>
            <IconWithTooltip title='Settings' placement='left'>
                <div
                    onClick={openModal}
                    style={{ cursor: 'pointer' }}
                    className={styles.settings_icon}
                >
                    <img src={settingsIcon} alt='settings' />
                </div>
            </IconWithTooltip>
            {settingsModalOrNull}
        </ContentHeader>
    );
}
