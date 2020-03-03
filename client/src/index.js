// Entry point.

const doc = document;

const createElement = (tag, content, classes = []) => {
    const element = doc.createElement(tag);
    element.innerText = content;
    if(classes){
        classes.forEach((classItem) => {
            element.classList.add(classItem);
        });
    }
    return element;
};

const addElement = (e) => {
    doc.body.appendChild(e);
};

const init = () => {
    
};

window.onload = init;