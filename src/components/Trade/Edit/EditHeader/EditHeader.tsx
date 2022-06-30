import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
// import styles from './EditHeader.module.css';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import truncateAddress from '../../../../utils/truncateAddress';

interface EditHeaderProps {
    positionHash?: string;
}
export default function EditHeader(props: EditHeaderProps) {
    const { positionHash } = props;
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div></div>
            <div>Edit: {positionHash ? truncateAddress(positionHash, 12) : ' 0xFD05...A3FF'}</div>
            <div onClick={() => navigate(-1)}>
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
