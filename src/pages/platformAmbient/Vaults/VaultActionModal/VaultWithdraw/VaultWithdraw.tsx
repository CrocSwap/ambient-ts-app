import { uriToHttp } from '../../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import RemoveRangeWidth from '../../../../../components/RangeActionModal/RemoveRangeWidth/RemoveRangeWidth';
import { FlexContainer } from '../../../../../styled/Common';
import styles from './VaultWithdraw.module.css';
import TooltipComponent from '../../../../../components/Global/TooltipComponent/TooltipComponent';
import Button from '../../../../../components/Form/Button';

import { TokenIF } from '../../../../../ambient-utils/types';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import { useState } from 'react';

interface Props {
    token0: TokenIF;
    token1: TokenIF;
    onClose: () => void;
}
export default function VaultWithdraw(props: Props) {
            // eslint-disable-next-line
    const { token0, token1, onClose } = props;
    const [showSubmitted, setShowSubmitted] = useState(false)
    // const [showWithdrawDropdown, setShowWithdrawDropdown] = useState(false);

    // const dropdownRef = useRef<HTMLDivElement>(null);

    // const clickOutsideHandler = () => {
    //     setShowWithdrawDropdown(false);
    // };

    // useOnClickOutside(dropdownRef, clickOutsideHandler);

    const tokensDisplay = (
        <FlexContainer
            alignItems='center'
            flexDirection='row'
            gap={5}
            style={{ flexShrink: 0 }}
        >
            {/* <TokenIcon
                token={token0}
                src={uriToHttp(token0.logoURI)}
                alt={token0.symbol}
                size={'xl'}
            /> */}
            <TokenIcon
                token={token1}
                src={uriToHttp(token1.logoURI)}
                alt={token1.symbol}
                size={'xl'}
            />
            <p className={styles.poolName}>{token1.symbol}</p>
        </FlexContainer>
    );

    // const withdrawDropdown = (
    //     <div className={styles.withdrawDropdownContainer}>
    //         <h3>Withdraw as</h3>

    //         <div className={styles.dropdownContainer} ref={dropdownRef}>
    //             <button
    //                 onClick={() =>
    //                     setShowWithdrawDropdown(!showWithdrawDropdown)
    //                 }
    //             >
    //                 ETH / USDC <RiArrowDropDownLine />
    //             </button>
    //             {showWithdrawDropdown && (
    //                 <section className={styles.dropdownContent}>
    //                     i sm dropdown content
    //                 </section>
    //             )}
    //         </div>
    //     </div>
    // );

    const pooledDisplay = (
        <section className={styles.pooledContent}>
            {/* <div className={styles.pooledContentContainer}>
                Pooled ETH
                <div className={styles.alignCenter}>
                    1.69
                    <TokenIcon
                        token={token0}
                        src={uriToHttp(token0.logoURI)}
                        alt={token0.symbol}
                        size={'s'}
                    />
                </div>
            </div> */}
            {/* <div className={styles.pooledContentRight}>
                Pooled USDC
                <div className={styles.alignCenter}>
                    1,690.00
                    <TokenIcon
                        token={token1}
                        src={uriToHttp(token1.logoURI)}
                        alt={token1.symbol}
                        size={'s'}
                    />
                </div>
            </div> */}

            <div className={styles.seperator}>
                <span />
            </div>
                <div className={styles.pooledContentContainer}>
                Deposited { token1.symbol}
                <div className={styles.alignCenter}>
                    1.69
                    <TokenIcon
                        token={token1}
                        src={uriToHttp(token1.logoURI)}
                        alt={token1.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                { token1.symbol} Removal Summary
                <div className={styles.alignCenter}>
                    1,690.00
                    <TokenIcon
                        token={token1}
                        src={uriToHttp(token1.logoURI)}
                        alt={token1.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            {/* <div className={styles.pooledContentContainer}>
                Earned ETH
                <div className={styles.alignCenter}>
                    1.69
                    <TokenIcon
                        token={token0}
                        src={uriToHttp(token0.logoURI)}
                        alt={token0.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                Earned USDC
                <div className={styles.alignCenter}>
                    1,690.00
                    <TokenIcon
                        token={token1}
                        src={uriToHttp(token1.logoURI)}
                        alt={token1.symbol}
                        size={'s'}
                    />
                </div>
            </div> */}
        </section>
    );
    const extraDetailsDisplay = (
        <div className={styles.extraDetailsContainer}>
            <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Slippage Tolerance</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>0.5%</p>
            </div>
            <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Network Fee</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>~$3.69</p>
            </div>
        </div>
    );

    const submittedButtonTitle = (
        <div className={styles.loading}>
            Submitting
            <span className={styles.dots}></span>

        </div>
    )

    return (
        <Modal usingCustomHeader onClose={onClose}>
        <ModalHeader
            onClose={onClose}
            title={'Withdraw'}
            // onBackButton={handleGoBack}
            // showBackButton={handleGoBack ? true: false}
        />
        <div className={styles.withdrawContainer}>
            {tokensDisplay}
            <RemoveRangeWidth
                removalPercentage={10}
                setRemovalPercentage={() => console.log('yes')}
            />
            {pooledDisplay}
           
                {extraDetailsDisplay}
              
            <Button
                idForDOM='approve_token_a_for_swap_module'
                style={{ textTransform: 'none' }}
                title={showSubmitted ? submittedButtonTitle : 'Remove Liquidity'}
                disabled={showSubmitted}
                action={() => setShowSubmitted(true)}
                flat
            />
            </div>
            </Modal>
    );
}
