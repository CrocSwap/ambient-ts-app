import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';

// interface RepositionHeaderPropsIF {
//     positionHash?: string;
// }
export default function RepositionHeader() {
    const positionHash = '0xFD054234fds34fffeA3FF';
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div>
                Edit Position:{' '}
                {positionHash ? trimString(positionHash, 4, 4, '…') : ' 0xFD05...A3FF'}
            </div>
            <div onClick={() => navigate(-1)}>
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
