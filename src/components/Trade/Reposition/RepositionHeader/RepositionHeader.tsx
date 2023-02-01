import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';
import { PositionIF } from '../../../../utils/interfaces/exports';
interface RepositionHeaderPropsIF {
    position: PositionIF | undefined;
}
export default function RepositionHeader(props: RepositionHeaderPropsIF) {
    const { position } = props;

    const positionHash = position?.positionStorageSlot || '';

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
