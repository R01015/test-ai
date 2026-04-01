const randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomAry = (array) => {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};
