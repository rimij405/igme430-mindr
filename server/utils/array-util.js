// Array utility functions.

// Check if array is empty.
const isEmpty = (arr) => {
    return Array.isArray(arr) && arr.length === 0;
}

// Check if array has input index.
const hasIndex = (arr, index) => { 
    return Array.isArray(arr)          
    && arr.length > 0
    && index >= 0    
    && index < arr.length;
};

// Check if array has neighboring index location.
const hasNext = (arr, index) => { 
    return hasIndex(arr, index) 
    && hasIndex(arr, index + 1);
};

// Check if array has previous index location.
const hasPrevious = (arr, index) => {
    return hasIndex(arr, index)
    && hasIndex(arr, index - 1);
};

// Check if index is at start of the array. False if array is empty.
const atStart = (arr, index) => {
    return Array.isArray(arr) && !isEmpty(arr) && index === 0;
};

// Check if index is at end of the array. False if array is empty.
const atEnd = (arr, index) => {
    return Array.isArray(arr) && !isEmpty(arr) && index === arr.length;
};

// Get element and perform an operation if successful.
const getElement = (arr, index) => {
    return new Promise((resolve = (element, index, array) => {},
                reject = (err) => {}) => {
                    if(!arr){
                        reject(new Error(`Array is undefined or null.`));
                    } else if(!Array.isArray(arr)){
                        reject(new Error(`Unexpected type. Input arr is not an Array.`));
                    } else if(isEmpty(arr)){
                        reject(new Error(`Index out of bounds. Array is empty.`));
                    } else if(hasIndex(arr, index)){
                        resolve(arr[index], index, arr);
                    } else {
                        reject(new Error(`Index out of bounds. Index '${index}' out of range [0, ${arr.length}).`));
                    }
                });
};

// Perform a deep copy of the elements in the array. If recurse is true, sub-arrays will also be deep copied.
const copy = (arr, recurse = false) => {
    if(!arr || !Array.isArray(arr)){
        // If not an array, don't copy it. Return null.
        return null;
    } else {
        let result = [];
        arr.forEach((element) => {
            if(Array.isArray(element) && recurse){
                result.push(copy(element, recurse));
            } else {
                result.push(element);
            }
        });
        return result;
    }
}

// Helper methods.
module.exports = {
    isEmpty,
    getElement,
    hasIndex,
    hasNext,
    hasPrevious,
    atStart,
    atEnd,
    copy
};