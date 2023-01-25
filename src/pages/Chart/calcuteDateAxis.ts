/* eslint-disable @typescript-eslint/no-explicit-any */
export const getOneHourAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    data.forEach((element: any) => {
        if (
            tempArray.length === 0 ||
            element.toDateString() !== tempArray[tempArray.length - 1].toDateString()
        ) {
            element.setMinutes(0);
            if (bandwidth > 60) {
                for (let i = 0; i < 24; i++) {
                    const res = new Date(element.setHours(i));
                    tempArray.push(res);
                }
            } else if (bandwidth > 20 && bandwidth <= 60) {
                for (let i = 0; i < 8; i++) {
                    const res = new Date(element.setHours(3 * i));
                    tempArray.push(res);
                }
            } else if (bandwidth < 20 && bandwidth >= 10) {
                for (let i = 0; i < 4; i++) {
                    const res = new Date(element.setHours(6 * i));
                    tempArray.push(res);
                }
            } else if (bandwidth < 10 && bandwidth >= 3) {
                for (let i = 0; i < 2; i++) {
                    const res = new Date(element.setHours(12 * i));
                    tempArray.push(res);
                }
            } else {
                tempArray.push(element);
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const getOneDayAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    let tempDate: any;
    data.forEach((element: any) => {
        if (bandwidth > 10) {
            tempDate = new Date(element);
            tempDate.setHours(3); // candle center
        } else {
            tempDate = new Date(element);
            tempDate.setDate(16);
            tempArray.push(element);
        }

        if (
            tempArray &&
            tempArray.find((item: any) => item.getTime() === tempDate.getTime()) === undefined
        ) {
            tempArray.push(tempDate);
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};

export const get4HoursAxisTicks = (data: any[], bandwidth: number) => {
    const tempArray: any = [];
    let tempDate: any;
    data.forEach((element: any) => {
        const tempfirstDayMonth = new Date(element);
        tempfirstDayMonth.setHours(0);
        if (
            tempfirstDayMonth &&
            tempArray.find((item: any) => item === tempfirstDayMonth) === undefined
        ) {
            tempArray.push(tempfirstDayMonth);
        }

        if (bandwidth > 60) {
            tempDate = new Date(element.setHours(6));
            for (let i = 0; i <= 4; i++) {
                const res = new Date(element.setHours(tempDate.getHours() + i * 4));

                if (
                    res &&
                    tempArray.find((item: any) => item.getTime() === res.getTime()) === undefined
                ) {
                    tempArray.push(res);
                }
            }

            if (
                tempDate &&
                tempArray.find((item: any) => item.getTime() === tempDate.getTime()) === undefined
            ) {
                tempArray.push(tempDate);
            }
        }
    });

    return tempArray.sort((a: any, b: any) => b.getTime() - a.getTime());
};
