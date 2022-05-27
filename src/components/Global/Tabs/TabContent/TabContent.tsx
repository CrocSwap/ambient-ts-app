interface TabContentProps {
    children: React.ReactNode;
    id: string;
    activeTab: string;
}
export default function Toggle(props: TabContentProps) {
    const { children, id, activeTab } = props;

    return activeTab === id ? <div className='TabContent'>{children}</div> : null;
}
