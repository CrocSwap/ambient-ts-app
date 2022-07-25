import DropdownMenu from '../../DropdownMenu/DropdownMenu';
import DropdownMenuContainer from '../../DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
import DropdownMenuItem from '../../DropdownMenu/DropdownMenuItem/DropdownMenuItem';
import { FiMoreHorizontal } from 'react-icons/fi';
import styles from './TableMenuComponents.module.css';

export default function TransactionsMenu() {
    const transactionsMenu = (
        <div className={styles.actions_menu}>
            <button>Edit</button>
            <button>Remove</button>
            <button>Details</button>
            <button>Copy</button>
        </div>
    );

    const dropdownTransactionsMenu = (
        <div className={styles.dropdown_menu}>
            <DropdownMenu title={<FiMoreHorizontal size={20} />}>
                <DropdownMenuContainer>
                    <DropdownMenuItem>
                        <button>Edit</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Remove</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Details</button>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <button>Copy</button>
                    </DropdownMenuItem>
                </DropdownMenuContainer>
            </DropdownMenu>
        </div>
    );
    return (
        <>
            {transactionsMenu}
            {dropdownTransactionsMenu}
        </>
    );
}
