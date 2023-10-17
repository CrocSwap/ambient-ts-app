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
    otherContents?: { title: string; content: React.ReactNode }[];
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
        ...(otherContents || []).map(({ title, content }, index) => ({
            label: title || `Other Content ${index + 1}`,
            content,
            key: `other${index}`,
        })),
    ];

    return (
        <>
            {contentItems.map(({ content, key }) => (
                <div
                    key={key}
                    style={{
                        display: key === activeContent ? 'block' : 'none',
                    }}
                >
                    {content}
                </div>
            ))}
        </>
    );
};
export default MultiContentComponent;
