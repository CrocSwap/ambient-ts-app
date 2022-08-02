import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';

// interface RepositionHeaderPropsIF {
//     positionHash?: string;
// }
export default function RepositionHeader() {
    const positionHash = '0xFD054234fds34fffeA3FF';
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div />
            <div className={styles.title}>
                Reposition: {positionHash ? trimString(positionHash, 4, 4, '…') : ' 0xFD05...A3FF'}
            </div>
            <div onClick={() => navigate(-1)}>
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
