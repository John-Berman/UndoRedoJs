var undoStack;
var redoStack;
var changed = {};
var undos = 10;
function changeObjFactory(node, deleted){
    this.inserted = undefined;
    this.deleted = deleted;
    this.node = node;
    this.id = node.id;
    this.property = '';
    this.changed = function(){
        return this.inserted !== this.deleted;
    }
}

// Returns the name of the property used by an input node for storing it's value.
function getPropertyName(e){
    switch(e.target.type){
        case 'checkbox':
            return 'checked';
        case 'radio':
            return 'checked';
        default:
            return 'value';
    }
}

// Change event handler for an input field that is to be tracked for undo and redo updates.
function changeHandler(e){
    let prop = getPropertyName(e);
    let target = e.target;
    if(changed.id === e.target.id){
        changed.inserted = target[prop];
        changed.property = prop;
        undoStack.push(changed);
    }
    return false;
}

// Focus event handler for an input field that is to be tracked for undo and redo updates.
function focusHandler(e){
    changed = new changeObjFactory(e.target,e.target[getPropertyName(e)]);
    return false;
}

// Function used for undo event.
function undoEvent(){
    let obj = undoStack.pop();
    if(obj){
        obj.node[obj.property] = obj.deleted;
        redoStack.push(obj);
    }
    return false;
}
// Function used for redo event.
function redoEvent(){
    let obj = redoStack.pop();
    if(obj){
        obj.node[obj.property] = obj.inserted;
        undoStack.push(obj);
    }
    return false;
}

// Implements a stack (FIFO) array for holding undo and redo values.
function stackFunc(limit){
    // limit is the maximum size of the stack.
    let stack = [];

    this.push = function(o){
        if(stack.length < limit){
            stack.push(o);
        } else {
            stack.shift();
            stack.push(o);
        }
        return stack;
    }

    this.pop = function(){
        return stack.pop();
    };

    this.clear = function() {
        stack = [];
    };
    this.getStack = function(){
        return stack;
    }
}

// Captures key press events for ctrl+Z (undo) and ctrl+Y (redo).
function keyPress(e){
    if(e.keyCode === 90 && e.ctrlKey){
        undoEvent();
    } else if(e.keyCode === 89 && e.ctrlKey){
        // Need to prevent default here or redo is fired twice.
        e.preventDefault();
        redoEvent();
        // Also return false to stop event bubbling up through DOM.
        return false;
    }
}

function main(maxUndos){
    undos = maxUndos || 10;
    undoStack = new stackFunc(undos);
    redoStack = new stackFunc(undos);
    let undoredoInputs = document.querySelectorAll('.undoredo');

    for(let i = 0; i <undoredoInputs.length;i++){
        let undoredo = undoredoInputs[i];
        undoredo.addEventListener('focus', focusHandler);
        undoredo.addEventListener('change', changeHandler);
    }

    document.onkeydown = keyPress;
}