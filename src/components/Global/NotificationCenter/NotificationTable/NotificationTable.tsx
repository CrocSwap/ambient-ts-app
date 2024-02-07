import { Dispatch, RefObject, SetStateAction, useContext } from 'react';
import ReceiptDisplay from '../ReceiptDisplay/ReceiptDisplay';

import {
    Container,
    Content,
    FooterButton,
    Header,
    MainContainer,
} from './NotificationTable.styles';
import { FlexContainer } from '../../../../styled/Common';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';

interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
    pendingTransactions: string[];
    notificationItemRef: RefObject<HTMLDivElement>;
}

const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable, pendingTransactions, notificationItemRef } =
        props;

    const { resetReceiptData, transactionsByType, sessionReceipts } =
        useContext(ReceiptContext);

    const parsedReceipts = sessionReceipts.map((receipt) =>
        JSON.parse(receipt),
    );

    const parsedReceiptsDisplay = parsedReceipts.map((receipt, idx) => (
        <ReceiptDisplay
            key={idx}
            status={receipt?.status === 1 ? 'successful' : 'failed'}
            hash={receipt?.transactionHash}
            txBlockNumber={receipt?.blockNumber}
            txType={
                transactionsByType.find(
                    (e) => e.txHash === receipt?.transactionHash,
                )?.txDescription
            }
        />
    ));

    const pendingTransactionsDisplay = pendingTransactions.map((tx, idx) => (
        <ReceiptDisplay
            key={idx}
            status='pending'
            hash={tx}
            txType={
                transactionsByType.find((e) => e.txHash === tx)?.txDescription
            }
        />
    ));

    if (!showNotificationTable) return null;
    return (
        <MainContainer>
            <Container
                flexDirection='column'
                justifyContent='space-between'
                fullWidth
                background='dark1'
                ref={notificationItemRef}
            >
                <Header>Recent Transactions</Header>

                <Content flexDirection='column' gap={8}>
                    {pendingTransactionsDisplay}
                    {parsedReceiptsDisplay}
                </Content>

                <FlexContainer justifyContent='center' margin='auto'>
                    <FooterButton
                        onClick={() => {
                            resetReceiptData();
                        }}
                        aria-label='Clear all'
                    >
                        Clear all
                    </FooterButton>
                </FlexContainer>
            </Container>
        </MainContainer>
    );
};

export default NotificationTable;
