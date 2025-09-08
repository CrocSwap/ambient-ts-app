import { useState, useRef, useEffect } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { FiCircle } from 'react-icons/fi';
import styles from './ProfileSettingsSkin.module.css';

// Animation styles are now handled in CSS

interface ProfileSettingSkinItemPropsIF {
    isSelected: boolean;
    name: string;
    onClick: () => void;
}

const skinItems = [
    {
        name: 'default',
        color: '#ff0055',
    },
    {
        name: 'win95',
        color: 'White',
    },
    {
        name: 'runescape',
        color: '#22cc88',
    },
    {
        name: '80s',
        color: '#22ccd88',
    },
];
export default function ProfileSettingsSkin() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(skinItems[0]);

    const dropdownMenuArrow = (
        <div
            className={`${styles.dropdown_arrow} ${isOpen ? styles.rotated : ''}`}
        >
            <svg width='15' height='15' viewBox='0 0 20 20'>
                <path d='M0 7 L 20 7 L 10 16' />
            </svg>
        </div>
    );

    function SkinItem(props: ProfileSettingSkinItemPropsIF) {
        const { isSelected, onClick, name } = props;

        return (
            <li
                className={`${styles.skin_item_container} ${isSelected ? styles.selected : ''}`}
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
    const handleItemClick = (skin: { name: string; color: string }) => {
        setSelected(skin);
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
                {skinItems.map((skin, idx) => (
                    <SkinItem
                        name={skin.name}
                        key={idx}
                        isSelected={selected.color === skin.color}
                        onClick={() => handleItemClick(skin)}
                    />
                ))}
            </ul>
        </div>
    );
}
