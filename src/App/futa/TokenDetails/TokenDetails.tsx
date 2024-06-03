import React, { ReactElement, useContext, useEffect, useState } from 'react';
import TokenDetailsHeader from './TokenDetailsHeader/TokenDetailsHeader';
import styles from './TokenDetails.module.css';
import DetailsContent from './DetailItems/DetailsContent';
import BidHistory from './BidHistory/BidHistory';
import Distribution from './Distribution/Distribution';
import BottomSheet from './BottomSheet/BottomSheet';
import JoinBid from './JoinBid/JoinBid';
import CustomBid from './CustomBid/CustomBid';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { BigNumber } from 'ethers';
import { toDisplayQty } from '@crocswap-libs/sdk';
import { getFormattedNumber } from '../../../ambient-utils/dataLayer';

export default function TokenDetails() {
    const { userAddress } = useContext(UserDataContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { setTokenBalance } = useContext(TokenBalanceContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { soloToken: selectedToken } = useContext(TradeDataContext);
    console.log({ selectedToken }, 'token details');
    const [bidQtyNonDisplay, setBidQtyNonDisplay] = useState<
        string | undefined
    >();
    const [_, setTokenModalOpen] = useState(false);

    const [tokenWalletBalance, setTokenWalletBalance] = useState<string>('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tokenDexBalance, setTokenDexBalance] = useState<string>('');
    const [recheckTokenAllowance, setRecheckTokenAllowance] =
        useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tokenAllowance, setTokenAllowance] = useState<string>('');

    const selectedTokenAddress = selectedToken.address;
    const selectedTokenDecimals = selectedToken.decimals;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [recheckTokenBalances, setRecheckTokenBalances] =
        useState<boolean>(false);
    const tokenWalletBalanceDisplay = tokenWalletBalance
        ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
        : undefined;

    const tokenWalletBalanceDisplayNum = tokenWalletBalanceDisplay
        ? parseFloat(tokenWalletBalanceDisplay)
        : undefined;

    const tokenWalletBalanceTruncated = getFormattedNumber({
        value: tokenWalletBalanceDisplayNum,
    });

    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [bottomSheetContent, setBottomSheetContent] =
        useState<null | ReactElement>(null);

    useEffect(() => {
        (async () => {
            if (crocEnv && userAddress && selectedTokenAddress) {
                try {
                    const allowance = await crocEnv
                        .token(selectedTokenAddress)
                        .allowance(userAddress);
                    setTokenAllowance(allowance.toString());
                } catch (err) {
                    console.warn(err);
                }
                setRecheckTokenAllowance(false);
            }
        })();
    }, [
        crocEnv,
        selectedTokenAddress,
        lastBlockNumber,
        userAddress,
        recheckTokenAllowance,
    ]);

    useEffect(() => {
        setTokenWalletBalance('');
        setTokenDexBalance('');
    }, [selectedToken.address, userAddress]);

    useEffect(() => {
        if (crocEnv && selectedToken.address && userAddress) {
            crocEnv
                .token(selectedToken.address)
                .wallet(userAddress)

                .then((bal: BigNumber) => {
                    setTokenWalletBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        walletBalance: bal.toString(),
                    });
                })
                .catch(console.error);

            crocEnv
                .token(selectedToken.address)
                .balance(userAddress)
                .then((bal: BigNumber) => {
                    setTokenDexBalance(bal.toString());

                    setTokenBalance({
                        tokenAddress: selectedToken.address,
                        dexBalance: bal.toString(),
                    });
                })
                .catch(console.error);
        }
    }, [
        crocEnv,
        selectedToken.address,
        userAddress,
        lastBlockNumber,
        recheckTokenBalances,
    ]);

    const handleCloseBottomSheet = () => {
        setIsBottomSheetOpen(false);
        setBottomSheetContent(null);
    };
    const joinBidProps = {
        setQty: setBidQtyNonDisplay,
        bidQtyNonDisplay,
        setTokenModalOpen,
        handleClose: handleCloseBottomSheet,
        tokenWalletBalance,
        tokenWalletBalanceTruncated,

        setBidQtyNonDisplay,
    };

    const handleJoinButton = () => {
        setIsBottomSheetOpen(true);
        setBottomSheetContent(<JoinBid {...joinBidProps} />);
    };

    const handleCustomButton = () => {
        setIsBottomSheetOpen(true);
        setBottomSheetContent(
            <CustomBid handleClose={handleCloseBottomSheet} />,
        );
    };

    const bidActionButtons = (
        <div className={styles.bidActionButtons}>
            <button onClick={handleJoinButton}>Join Bid</button>
            <button onClick={handleCustomButton}>Custom Bid</button>
        </div>
    );

    return (
        <div className={styles.fullPage}>
            <div className={styles.container}>
                <TokenDetailsHeader />

                <div className={styles.content}>
                    <DetailsContent />
                    <BidHistory />
                    <Distribution />
                    {bidActionButtons}
                </div>
                <BottomSheet isOpen={isBottomSheetOpen}>
                    {bottomSheetContent}
                </BottomSheet>
            </div>
        </div>
    );
}
