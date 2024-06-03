import { MdClose } from 'react-icons/md';
import styles from './CustomBid.module.css';

interface Props {
    handleClose: () => void;
}
export default function CustomBid(props: Props) {
    const { handleClose } = props;

    return (
        <div className={styles.container}>
            <header>
                <span />
                Custom Bid
                <MdClose color='#8b98a5' onClick={handleClose} />
            </header>
        </div>
    );
}
