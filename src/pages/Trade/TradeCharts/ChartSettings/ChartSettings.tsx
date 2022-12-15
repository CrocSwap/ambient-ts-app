import styles from './ChartSettings.module.css';

interface ChartSettingsPropsIF {
    showChartSettings: boolean;
}
export default function ChartSettings(props: ChartSettingsPropsIF) {
    const { showChartSettings } = props;
    return <div className={styles.container}>chart</div>;
}
