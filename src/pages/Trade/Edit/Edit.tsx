import ComponentToggle from '../../../components/Trade/Edit/ComponentToggle/ComponentToggle';
import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';

// interface EditProps {
//     children: React.ReactNode;
// }

export default function Edit() {
    return (
        <div className={styles.editContainer}>
            <EditHeader />
            <ComponentToggle />
        </div>
    );
}
