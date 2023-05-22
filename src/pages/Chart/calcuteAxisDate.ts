/* eslint-disable @typescript-eslint/no-explicit-any */
export const correctStyleForData = (
    startDateTime: number,
    endDateTime: number,
    dataTime: any,
) => {
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);

    let data: any[] = [];

    dataTime.map((d: any) => {
        data.push(new Date(d));
    });

    data = addFirstDayMonth(data);
    if (!filterYears(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item,
                style:
                    item.getHours() === 0 &&
                    item.getMonth() === 0 &&
                    item.getDate() === 1,
            };
        });
    } else if (!filteredFirstDay(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item,
                style: item.getHours() === 0 && item.getDate() === 1,
            };
        });
    } else if (!filteredHour(startDate, endDate, data)) {
        data = data.map((item: any) => {
            return {
                date: item,
                style: item.getHours() === 0 && item.getMinutes() === 0,
            };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 0)) {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 0 };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 5)) {
        data = data.map((item: any) => {
            return { date: item, style: true };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 10)) {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 10 };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 15)) {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 15 };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 30)) {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 30 };
        });
    } else if (!_filteredMinute(startDate, endDate, data, 45)) {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 45 };
        });
    } else {
        data = data.map((item: any) => {
            return { date: item, style: item.getMinutes() === 45 };
        });
    }

    return data.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
};

const addFirstDayMonth = (data: any[]) => {
    const tempArray: any = [...data];
    data.forEach((element) => {
        const tempfirstDayMonth = new Date(element);
        tempfirstDayMonth.setDate(1);
        tempfirstDayMonth.setHours(0);
        tempfirstDayMonth.setMinutes(0);
        tempfirstDayMonth.setMilliseconds(0);

        if (
            data.find(
                (item: any) =>
                    item.getMonth() === tempfirstDayMonth.getMonth() &&
                    item.getDate() === tempfirstDayMonth.getDate(),
            ) === undefined
        ) {
            tempArray.push(tempfirstDayMonth);
        }
    });

    return tempArray;
};

const filterYears = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item &&
                endDate > item &&
                (item.getDate() === 1 &&
                    item.getMonth() === 0 &&
                    item.getHours()) === 0,
        ).length === 0
    );
};
const filteredFirstDay = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item &&
                endDate > item &&
                (item.getDate() === 1 && item.getHours()) === 0,
        ).length === 0
    );
};

const filteredHour = (startDate: Date, endDate: Date, data: any) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item &&
                endDate > item &&
                item.getHours() === 0 &&
                item.getMinutes() === 0,
        ).length === 0
    );
};

const _filteredMinute = (
    startDate: Date,
    endDate: Date,
    data: any,
    minuteControl: number,
) => {
    return (
        data.filter(
            (item: any) =>
                startDate < item &&
                endDate > item &&
                item.getMinutes() === minuteControl,
        ).length === 0
    );
};
