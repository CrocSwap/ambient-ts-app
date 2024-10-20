import styles from './ExploreToggle.module.css'

interface PropsIF{
    view: 'pools' | 'tokens';
    handleToggle(): void
}
export default function ExploreToggle(props: PropsIF) {
    const { view, handleToggle} = props
    


    return (
        <div className={styles.container}>
            <button className={view === 'pools' ? styles.activeButton : ''} onClick={handleToggle}>Pools</button>
            <button className={view === 'tokens' ? styles.activeButton : ''} onClick={handleToggle}>Tokens</button>
        </div>
    )
}