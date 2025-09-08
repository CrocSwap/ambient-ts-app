import { useState, useRef, useEffect } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { FiCircle } from 'react-icons/fi';
import styles from './ProfileSettingsTheme.module.css';

// Animation styles are now handled in CSS

interface ProfileSettingItemPropsIF {
    isSelected: boolean;
    name: string;
    onClick: () => void;
}

const themeItems = [
    {
        name: 'default',
        color: '#ff0055',
    },
    {
        name: 'Light',
        color: 'White',
    },
    {
        name: 'Dark',
        color: '#22cc88',
    },
];
export default function ProfileSettingsTheme() {
    // const menuRef = useRef<HTMLUListElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(themeItems[0]);
    // const clickOutsideHandler = () => {
    //     setIsOpen(false);
    // };
    // UseOnClickOutside(menuRef, clickOutsideHandler);

    const dropdownMenuArrow = (
        <div
            className={`${styles.dropdown_arrow} ${isOpen ? styles.rotated : ''}`}
        >
            <svg width='15' height='15' viewBox='0 0 20 20'>
                <path d='M0 7 L 20 7 L 10 16' />
            </svg>
        </div>
    );

    function ThemeItem(props: ProfileSettingItemPropsIF) {
        const { isSelected, onClick, name } = props;

        return (
            <li
                className={`${styles.theme_item_container} ${isSelected ? styles.selected : ''}`}
                onClick={onClick}
            >
                {name}
                {isSelected ? (
                    <BsCheckCircle size={24} color='#CDC1FF' />
                ) : (
                    <FiCircle size={24} color='#CDC1FF' />
                )}
            </li>
        );
    }

    const handleItemClick = (theme: { name: string; color: string }) => {
        setSelected(theme);
        setIsOpen(false);
    };
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.menu} ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`${styles.main_button} ${isOpen ? styles.active : ''}`}
            >
                {selected.name}
                {dropdownMenuArrow}
            </button>

            <ul
                className={`${styles.main_container} ${isOpen ? styles.open : ''}`}
                style={{ display: isOpen ? 'block' : 'none' }}
            >
                {themeItems.map((theme, idx) => (
                    <ThemeItem
                        name={theme.name}
                        key={idx}
                        isSelected={selected.color === theme.color}
                        onClick={() => handleItemClick(theme)}
                    />
                ))}
            </ul>
        </div>
    );
}
