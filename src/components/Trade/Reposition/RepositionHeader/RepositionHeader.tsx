import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './RepositionHeader.module.css';

interface propsIF {
    positionHash: string;
    redirectPath: string;
}

export default function RepositionHeader(props: propsIF) {
    const { positionHash, redirectPath } = props;
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div />
            <div className={styles.title}>Reposition: {trimString(positionHash, 4, 4, '…')}</div>
            <div
                onClick={() => navigate(redirectPath, { replace: true })}
                style={{ cursor: 'pointer' }}
            >
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
