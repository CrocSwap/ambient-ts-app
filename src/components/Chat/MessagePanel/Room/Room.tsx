import styles from './Room.module.css';
export default function Room() {
    const rooms = [
        {
            id: 0,
            name: 'Global',
        },
        {
            id: 1,
            name: 'Current Pool',
        },
    ];
    return (
        <div className={styles.room_body}>
            <select className={styles.dropdown}>
                {rooms.map((tab) => (
                    <option className={styles.dropdown_item} key={tab.id}>
                        {tab.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
