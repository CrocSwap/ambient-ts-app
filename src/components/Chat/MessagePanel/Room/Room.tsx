import styles from './Room.module.css';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';

interface FavoritePoolsIF {
    favePools: PoolIF[];
}

export default function Room(props: { favePools: { [x: string]: any } }) {
    const defaultRooms = [
        {
            id: 0,
            name: 'Global',
        },
        {
            id: 1,
            name: 'Current Pool',
        },
    ];

    const rooms = props.favePools;
    return (
        <div className={styles.room_body}>
            <select className={styles.dropdown}>
                {defaultRooms.map((tab) => (
                    <option className={styles.dropdown_item} key={tab.id}>
                        {tab.name}
                    </option>
                ))}
                {rooms.map((pool: PoolIF) => (
                    <option className={styles.dropdown_item} key={pool.poolId}>
                        {pool.base.symbol} / {pool.quote.symbol}
                    </option>
                ))}
            </select>
        </div>
    );
}
