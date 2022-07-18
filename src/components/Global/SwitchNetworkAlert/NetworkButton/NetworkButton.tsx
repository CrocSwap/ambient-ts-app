import styles from './NetworkButton.module.css';

// interface NetworkButtonProps {
//     children: React.ReactNode;
// }

export default function NetworkButton() {
    function handleClick() {
        console.log('clicked');
    }

    const network = {
        theme: 'blue',
        name: 'blue network',
    };
    return (
        <button
            className={styles.networkButton}
            onClick={() => handleClick}
            style={{ background: network.theme }}
        >
            Switch to {network.name}
        </button>
    );
}
