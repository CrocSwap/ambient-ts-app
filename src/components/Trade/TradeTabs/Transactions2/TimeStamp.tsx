import moment from 'moment';
import { getElapsedTime } from '../../../../App/functions/getElapsedTime';
import { FlexContainer } from '../../../../styled/Common/Container';
import { RowItem } from '../../../../styled/Components/TransactionTable';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { Text } from '../../../../styled/Common';
import { TransactionServerIF } from '../../../../utils/interfaces/TransactionIF';

interface propsIF {
    tx: TransactionServerIF;
    width: number;
}

export default function TimeStamp(props: propsIF) {
    const { tx, width } = props;
    return (
        <RowItem gap={4} width={width}>
            <TextOnlyTooltip
                interactive
                title={
                    <FlexContainer
                        fullWidth
                        justifyContent='center'
                        background='dark3'
                        color='text1'
                        padding='12px'
                        gap={8}
                        rounded
                        role='button'
                        onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                            event.stopPropagation()
                        }
                    >
                        {moment(tx.txTime * 1000).format('MM/DD/YYYY HH:mm')}
                    </FlexContainer>
                }
                placement={'right'}
                enterDelay={750}
                leaveDelay={0}
            >
                <Text style={{ textTransform: 'lowercase' }} tabIndex={0}>
                    {getElapsedTime(moment(Date.now()).diff(tx.txTime * 1000, 'seconds'))}
                </Text>
            </TextOnlyTooltip>
        </RowItem>
    );
}