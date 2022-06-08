import ComponentToggle from '../../../components/Trade/Edit/ComponentToggle/ComponentToggle';
import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams } from 'react-router-dom';

// interface EditProps {
//     children: React.ReactNode;
// }

export default function Edit() {
    const { positionHash } = useParams();
    console.log(positionHash);
    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            <ComponentToggle />
        </div>
    );
}
