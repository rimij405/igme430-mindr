// Entry point.

const doc = document;

const createElement = () => {
    const element = doc.createElement('div');
    element.innerText = "This should be red.";
    element.classList.add('hello');
    return element;
};

const addElement = (e) => {
    doc.body.appendChild(e);
};

const init = () => {
    console.log("Window initialized.");
    addElement(createElement());
    console.log("Testing after build.");
};

window.onload = init;