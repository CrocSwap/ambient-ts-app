import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import trimString from '../../../../utils/functions/trimString';
import styles from './EditHeader.module.css';
interface EditHeaderPropsIF {
    positionHash?: string;
}
export default function EditHeader(props: EditHeaderPropsIF) {
    const { positionHash } = props;
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div />
            <div className={styles.title}>
                Edit Position:{' '}
                {positionHash ? trimString(positionHash, 4, 4, '…') : ' 0xFD05...A3FF'}
            </div>
            <div onClick={() => navigate(-1)}>
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
