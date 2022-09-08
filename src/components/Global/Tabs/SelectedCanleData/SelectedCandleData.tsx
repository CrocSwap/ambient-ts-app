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
                backgroundColor: 'rgba(228,128,255, 0.60)',
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
