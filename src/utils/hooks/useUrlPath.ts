export const useUrlPath = () => {
    console.log('bam a lam');
    const baseUrlPaths = new Map([
        ['index', '/'],
        ['testpage', '/testpage'],
    ]);
    function getPath(page: string) {
        return baseUrlPaths.get(page);
    }

    return {
        getPath,
    };
};
