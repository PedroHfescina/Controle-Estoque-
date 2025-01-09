const formatDate =  (date: string): string =>{
    const dateformat = new Date(date);

    const day = dateformat.getDate() > 9
    ? dateformat.getDate() : `0${dateformat.getDate()}`;	

    const month = dateformat.getMonth() + 1 > 9
    ? dateformat.getMonth() + 1 : `0${dateformat.getMonth()} + 1`;

    const year = dateformat.getFullYear();

    return `${day}/${month}/${year}`
};

export default formatDate;