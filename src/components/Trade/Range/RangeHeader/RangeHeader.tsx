// START: Import React and Dongles

// START: Import React Functional Components
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import TransactionSettings from '../../../Global/TransactionSettings/TransactionSettings';

// START: Import Local Files
import styles from './RangeHeader.module.css';
import { SlippagePairIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import settingsIcon from '../../../../assets/images/icons/settings.svg';
import Modal from '../../../../components/Global/Modal/Modal';
import { useModal } from '../../../../components/Global/Modal/useModal';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../../utils/state/tradeDataSlice';

// interface for component props
interface RangeHeaderPropsIF {
    chainId: string;
    tokenPair: TokenPairIF;
    mintSlippage: SlippagePairIF;
    isDenomBase: boolean;
    isTokenABase: boolean;
}

// central react functional component
export default function RangeHeader(props: RangeHeaderPropsIF) {
    const { chainId, tokenPair, mintSlippage, isDenomBase, isTokenABase } = props;

    const [isModalOpen, openModal, closeModal] = useModal();

    const dispatch = useAppDispatch();

    const reverseDisplay = (isTokenABase && isDenomBase) || (!isTokenABase && !isDenomBase);

    const settingsModalOrNull = isModalOpen ? (
        <Modal noHeader title='modal' onClose={closeModal}>
            <TransactionSettings
                chainId={chainId}
                module='Range Order'
                tokenPair={tokenPair}
                slippage={mintSlippage}
                onClose={closeModal}
            />
        </Modal>
    ) : null;

    return (
        <ContentHeader>
            <span />
            <div className={styles.token_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                {reverseDisplay ? tokenPair.dataTokenA.symbol : tokenPair.dataTokenB.symbol} /{' '}
                {reverseDisplay ? tokenPair.dataTokenB.symbol : tokenPair.dataTokenA.symbol}
            </div>
            <div onClick={openModal}>
                <img src={settingsIcon} alt='settings' />
            </div>
            {settingsModalOrNull}
        </ContentHeader>
    );
}
