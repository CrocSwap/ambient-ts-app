import moment from 'moment';
import { CandleData } from '../../../../utils/state/graphDataSlice';

interface InformationData {
    filter: CandleData | undefined;
}

export default function SelectedCandleData(props: InformationData) {
    return (
        <div
            className='infoBar'
            style={{
                width: '100%',
                backgroundColor: 'rgba(247, 56, 91, 0.70)',
                textAlign: 'center',
            }}
        >
            {' '}
            Showing Transactions for{' '}
            {moment(props.filter?.time !== undefined ? props.filter?.time * 1000 : null).format(
                'DD MMM  HH:mm',
            )}{' '}
        </div>
    );
}
