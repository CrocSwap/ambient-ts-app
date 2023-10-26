import React from 'react';

interface ContentItem {
    label: string;
    content: React.ReactNode;
    key: string;
}

interface MultiContentComponentProps {
    mainContent: React.ReactNode;
    settingsContent: React.ReactNode;
    confirmationContent: React.ReactNode;
    otherContents?: {
        title: string;
        content: React.ReactNode;
        activeKey: string;
    }[];
    activeContent: string;
    setActiveContent: (key: string) => void;
}

const MultiContentComponent: React.FC<MultiContentComponentProps> = ({
    mainContent,
    settingsContent,
    confirmationContent,
    otherContents = [],
    activeContent,
}) => {
    const contentItems: ContentItem[] = [
        { label: 'Main Content', content: mainContent, key: 'main' },
        {
            label: 'Settings Content',
            content: settingsContent,
            key: 'settings',
        },
        {
            label: 'Confirmation Content',
            content: confirmationContent,
            key: 'confirmation',
        },
        ...(otherContents || []).map(({ title, content, activeKey }) => ({
            label: title || 'Other Content',
            content,
            key: activeKey,
        })),
    ];

    console.log('activeContent', activeContent);
    const activeKeyFromOtherContent = otherContents.find(
        (content) => content.activeKey === activeContent,
    )?.activeKey;

    return (
        <>
            {contentItems.map(({ content, key }) => (
                <div
                    key={key}
                    style={{
                        display:
                            key === (activeKeyFromOtherContent || activeContent)
                                ? 'block'
                                : 'none',
                    }}
                >
                    {content}
                </div>
            ))}
        </>
    );
};
export default MultiContentComponent;
