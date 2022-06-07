import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import styles from './EditHeader.module.css';
import { RiCloseFill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

export default function EditHeader() {
    const navigate = useNavigate();

    return (
        <ContentHeader>
            <div></div>
            <div>0xFD05...A3FF</div>
            <div onClick={() => navigate(-1)}>
                <RiCloseFill />
            </div>
        </ContentHeader>
    );
}
