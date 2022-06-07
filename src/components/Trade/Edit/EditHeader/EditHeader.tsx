import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import styles from './EditHeader.module.css';
import { RiCloseFill } from 'react-icons/ri';

export default function EditHeader() {
    return (
        <ContentHeader>
            <div></div>
            <div>0xFD05...A3FF</div>
            <RiCloseFill />
        </ContentHeader>
    );
}
