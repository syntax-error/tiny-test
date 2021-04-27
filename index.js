/***** BROWSER DIFFERENCES *****/

/*
    We are going to be writing code for DOM querying. Imagine the pseudo DOM tree below. Each ellipse represents
    a DOM node. We say that a node has a child if a node exists directly below it in the tree, and a parent if it has a
    node directly above it in the tree. So, the node dessert has a child of eclair and a parent of bread. A grandparent
    is a parent of a parent, so dessert has a grandparent of apple.
    These are the APIs for node manipulation on three different browsers. The three browsers are called X, Y, and Z
    ● parentNode: Is null on Browser X and Y and undefined on Browser Z if there is no parent (e.g.
    apple.parentNode === null on X). Otherwise, it is the node that is the parent (e.g. dessert.parentNode ===
    bread)
    ● nodeName: Is lowercase node name on Browser X (e.g. “apple”) and uppercase node name on Browser
    Y and Z (e.g. ”APPLE”)

    Note, not all details are provided in these questions. When you give an answer, list any assumptions you have
    made about the question. Also, argue why you have chosen to interpret it that way. This is as important as the
    answer in some ways.
*/

/*
    1. Write a function getGrandparentName(node) that, given a node, returns the node name of the grandparent
    of that node. Must work on all browsers

    Tim's Notes:
    I've assumed that this intended to be a browser agnostic interface for trawling DOM nodes, so I've made the
    following assumptions to go with that:
    - a failure to find a node always results in `undefined`
    - a failure to find a node's name results in `undefined`
    - node names are always returned in lower case, regardless of browser
         (because it should be one or the other, and I like lower case more)
*/
const getNodeName = (node) => {
    return node?.nodeName?.toLowerCase?.();
};

const getAncestorNode = (node, generations = 1) => {
    if (generations < 1) {
        throw new Error('Generations out of range (minimum 1)')
    }
    if (!node) {
        return;
    }
    if (generations === 1) {
        return node.parentNode;
    }
    return getAncestorNode(node.parentNode, generations - 1);
};

exports.getGrandparentName = (node) => {
    const grandparentNode = getAncestorNode(node, 2);
    return getNodeName(grandparentNode);
};
/*
    2. Write a function getGrandparent(node) that, given a node, returns the grandparent of that node. Must work
    on all browsers
*/
exports.getGrandparent = (node) => {
    return getAncestorNode(node, 2);
};
/*
    3. Give a new definition of getGrandparentName that uses your definition of getGrandparent from (2)
*/
exports.getGrandparentNameTwo = (node) => {
    return getNodeName(exports.getGrandparent(node));
};
/*
    4. Write a function getGreatGrandparent(node) that given a node, returns the node that is the great
    grandparent of node (e.g. getGreatGrandparent(eclair) === apple). Must work on all browsers
*/
exports.getGreatGrandparent = (node) => {
    return getAncestorNode(node, 3);
}
/*
    5. What are your thoughts about your implementations above? If you knew you had to write all of these
    functions at the start, would you have changed your approach? If so, why? How well does your approach
    scale to going even further up the tree?

    Tim's notes: I chose an implementation with tail call recursion from the start. Typically when implementing a
    function that is doing the same steps two or three times, it's just as easy to write a function that lets you
    do that step N times, and has the added benefit of being reusable for more than just that specific task.

    I also chose to make a function that return's a node's name, because if you want consistency, it's easier to
    manage it from a single, reusable function, then copy-pasting everywhere.

    So, in response to the questions, no, I wouldn't change my approach, as it was already designed to be able to
    traverse infinitely up the tree until it tries to get the parent of the root node, upon which it fails to find.
 */

/***** OPTIONS *****/

/*
    A developer in your team wants to introduce a new concept from functional programming languages called an
    Option. An Option is a type of value that may or may not be there. The developer wants getGrandparentName
    and getGrandparent to return an Option. They have provided two ways to create an option:
    ● Option.none() => returns an option where there is no value
    ● Option.some(v) => returns an option where the value is v

    If an Option is created with Option.none(), we say it is “none”, and if it is created with Option.some(v),
    we say it is “some of v”.
    and instance methods of an Option, isSome and getOrDie
    ● o.isSome() => true if some of v and false if none
    ● o.getOrDie() => v if some of v, and throws an error otherwise

    // showing how isSome works
    nothing.isSome(); // returns false
    something.isSome(); // returns true
    // showing how getOrDie works
    nothing.getOrDie(); // throws an error
    something.getOrDie(); // returns 5
 */

/*
    1. Using these methods for Option, rewrite getGrandparentName(node) and getGrandparent(node) to return Options.
    Tim's Notes: also assuming that nodes are passed in as Options
 */

const getNodeNameAsOption = (nodeOption) => {
    return nodeOption.isSome()
        ? Option.some(nodeOption.getOrDie().nodeName.toLowerCase())
        : Option.none();
};

const getAncestorNodeAsOption = (nodeOption, generations = 1) => {
    if (generations < 1) {
        throw new Error('Generations out of range (minimum 1)')
    }
    if (!nodeOption.isSome()) {
        return Option.none();
    }
    const parentNode = nodeOption.getOrDie().parentNode;
    if (!parentNode) {
        return Option.none();
    }
    if (generations === 1) {
        return Option.some(parentNode);
    }
    return getAncestorNodeAsOption(Option.some(parentNode), generations - 1);
};

exports.getGrandparentAsOption = (nodeOption) => {
    return getAncestorNodeAsOption(nodeOption, 2);
};

exports.getGrandparentNameAsOption = (nodeOption) => {
    return getNodeNameAsOption(getAncestorNodeAsOption(nodeOption, 2));
};

/*
    Recognising that they haven’t really achieved their goal, and that they don’t like throwing errors, the developer
    introduces two more instance methods for Option:
    o.map(f) => takes a function f which operates on a v and returns a new value which map then wraps in
    a some. If it is none, the function is not called and map returns a none. Does not change original Option.
    o.bind(f) => takes a function f which operates on a value v and returns either a none or a some of a
    new value. If the option was none to begin with, the function is not called and bind returns a none. Does
    not change original Option.

    // showing how map works
    nothing.map((v) => { return v + 1; }); // none()
    something.map((v) => { return v + 1; }); // some(6)
    // showing how bind works
    nothing.bind((v) => { return Option.some(0); }); // none()
    something.bind((v) => { return v == 5 ? Option.some(10) : Option.none(); }); // some(10)
    something.bind((v) => { return v == 3 ? Option.some(10) : Option.none(); }); // none()
 */

/*
    2. Using these two functions, remove any usage of isSome and getOrDie, and rewrite getGrandparentName
    and getGrandparent to use map and/or bind.
    3. Now, also rewrite getGreatGrandparent and using map and/or bind
    Tim's Notes: I'm a little disappointed on getAncestorNodeUsingMapBind, because the recursion will always go to max
    generations, without some sort of isSome check to exit prematurely.
 */

const getNodeNameUsingMapBind = (nodeOption) => {
    return nodeOption.map((node) => { return node.nodeName.toLowerCase(); });
};

const getAncestorNodeUsingMapBind = (nodeOption, generations = 1) => {
    if (generations < 1) {
        throw new Error('Generations out of range (minimum 1)')
    }
    const parentNodeOption = nodeOption.bind((node) => {
        return node.parentNode ? Option.some(node.parentNode) : Option.none();
    });
    if (generations === 1) {
        return parentNodeOption;
    }
    return getAncestorNodeAsOption(parentNodeOption, generations - 1);
};

exports.getGrandparentUsingMapBind = (nodeOption) => {
    return getAncestorNodeUsingMapBind(nodeOption, 2);
};

exports.getGrandparentNameUsingMapBind = (nodeOption) => {
    return getNodeNameUsingMapBind(getAncestorNodeUsingMapBind(nodeOption, 2));
};

/*
    4. What do you think of the developer’s Option approach. What are its strengths? What are its weaknesses?

    Tim's Notes: It has the advantages that you're not dealing with JS's innate null/undefined ambiguity, and should
    (provided proper programming) always be able to tell between values and non-values.
    On the disadvantages side, despite not altering the value of an Option with map/bind, it isn't perfectly immutable;
    unless there is heavy deep cloning happening, if the option wraps an object or array, that object/array can be
    mutated inside the function passed to map/bind.
    Additionally, you may have to consider readability and developer knowledge as overheads. If the code needs to be
    read or utilised by people unfamiliar with Options (especially with this specific implementation), then you can have
    some very confused developers trying to parse your code.
 */

/*
    The developer is starting to like this Option concept, but they feel that there is something rather large still missing.
    They want to be able to branch on none and some more elegantly (rather than using isSome and getOrDie). Thus,
    they try to use the ‘fold’ concept. Fold is an instance method of an Option that takes two functions, one with no
    arguments that is only invoked if it is none, and one with one argument v that is only invoked if the Option is is
    some of v).
    // showing how fold works
    nothing.fold(
        function () { return ‘none’; },
        function (v) { return ‘some of ‘ + v; }
    ); // ‘none’
    something.fold(
        function () { return ‘none’; },
        function (v) { return ‘some of ‘ + v; }
    ); // ‘some of 5’
 */

/*
    5. Write a function getParentOrSelf(node) which uses fold and takes a node and returns a parent of that node
    if one exists, otherwise the node itself.
    You can see that fold can fulfil a similar objective to using isSome and if. Think about why someone might want to
    use one over the other. It may help to write out the two side-by-side and compare for the getParentOrSelf
    example.
    Tim's Notes: Again, assuming that nodes are passed in as Options. Feels a bit clunky to read. I could see where
    function chaining could be desirable, but I feel that an `if` would provide more readability.
 */

exports.getParentOrSelf = (nodeOption) => {
    return nodeOption.bind(
        (node) => { return node.parentNode ? Option.some(node.parentNode) : Option.none(); }
    ).fold(
        () => { return nodeOption; },
        (parentNodeOption) => { return parentNodeOption; }
    );
};

/***** MUTABILITY *****/

/*
    Consider this stack code written with options:
    var stack = new Stack(); // the stack is { }
    stack.push(10); // the stack is now { 10 }
    stack.push(20); // the stack is now { 10, 20 }
    stack.push(30); // the stack is now { 10, 20, 30 }
    stack.pop(); // Option.some(30) and the stack is now { 10, 20 }
    stack.peek(); // Option.some(20) and the stack is still { 10, 20 }
    stack.peek(); // Option.some(20); and the stack is still { 10, 20 }
    stack.push(40); // the stack is now { 10, 20, 40 }
    stack.size(); // 3 and the stack is still { 10, 20, 40 }
 */

/*
    1. One way of testing a stack’s operations is to identify relationships that should hold between the operations.
    Given a completely random stack, list all of the relationships that you can think of between (push, pop,
    peek, size). We’ll get you started
    ● If peek is none(), then stack size should be 0
    ● if peek is some(anyValue), then stack size should be greater than 0
    ● after push(x), pop should return some(x)
    ● ...

    Tim's Notes:
    * after push(x), size should return 1 more than before push
    * after push(x), peek should return some(x)
    * if pop is none(), then size should be 0
    * if pop is some(anyValue), then size should be 1 less than before pop
    * if peek is some(x), then pop should return some(x)
    * if size is 0, then pop should return none()
    * if size is greater than 0, then pop should return some(anyValue)
 */

/*
    Introducing immutability:
    Instead of using an object to represent a stack, we can simplify it to just be an array. Assume now that push is no
    longer an instance method but instead takes two arguments (stack, value) and returns a new stack. Assume also
    that peek and pop also take the stack as an argument and return a new one (in addition to any information that
    they previously returned). Size, similarly, will need to take the stack as an input in this approach.
 */

/*
    2. Rewrite the stack pseudo code using these new methods. We’ll get you started...
    var s0 = [ ];
    var s1 = push(s0, 10);
    var s2 = push(....)

    Tim's Notes:
    var s0 = [ ]; // [ ]
    var s1 = push(s0, 10); // [ 10 ]
    var s2 = push(s1, 20); // [ 10, 20 ]
    var s3 = push(s2, 30); // [ 10, 20, 30 ]
    var s4 = pop(s3); //  Option.some(30) and a new array [ 10, 20 ]
    stack.peek(s3); // Option.some(30) and a new array [ 10, 20, 30 ]
    stack.peek(s3); // Option.some(20) and a new array [ 10, 20, 30 ]
    var s5 = push(s3, 40); // [10, 20, 30, 40]
    size(s0); // 0
    size(s1); // 1
    size(s2); // 2
    size(s3); // 3
    size(s4); // 2
    size(s5); // 4
 */

/*
    3. What is the difference between this implementation and the previous Stack object implementation?

    Tim's Notes: Immutability. The first mutates the stack every time push or pop is called, meaning the stack is
    going to be whatever shape you mash it into with all your function calls. Conversely, the second stack will never
    be touched; any values added via push, or removed via pull, will always result in a new, different stack being
    returned.
 */

/*
    4. What are the advantages and disadvantages?

    Tim's Notes: When it comes to array like objects, there are times mutability is a good thing. In rare cases,
    several objects may desire to share the same stack, without necessarily otherwise having access to the same scope.
    In this case, it can be useful for changes to the stack to be reflected for all those objects. Conversely, there
    are also times when immutability is desirable, for instance, when you wish to keep the original stack for other
    purposes.

    Both possess their own dangers. A mutable stack can influence other uses of itself, unintentionally fouling other
    code. Care must be taken with the immutable stack so that you're saving the version of the stack you want to use,
    lest you end up using the original stack when you wanted the edited stack, or vice versa.

    In both cases, neither are necessarily bad; only that you have to be aware of what your needs are and which stack
    implementation is appropriate.

 */

/*
    5. Which one do you think would be easier to test? Why?

    Tim's Notes: The second one; mutability runs the risk of cross-test contamination: mutations caused by one test
    mightn't be cleared for the next test, potentially causing false positives and negatives to occur when values line
    up in a way they mightn't in another circumstance
 */

/***** EVENTS *****/

/*
    Note, in the following code we are using let instead of var
    1. Why is that? What would happen if we used var?
    Because of scoping. Using var means that the declared variable gets hoisted to top of the function scope. In this
    case, it means that the `c` and `r` referenced in console.log will be referencing the same value in all loops,
    instead of a unique value per loop, eventually culminating in every console.log will say `${rows}x${columns}`
    regardless of their actual row or column.

*/

/*
    Imagine a table created by:

    var makeTable = function (rows, columns) {
        let table = document.createElement('table');
        let tbody = document.createElement('tbody');
        for (let r = 0; r < rows; r++) {
            let tr = document.createElement('tr');
            for (let c = 0; c < columns; c++) {
                let td = document.createElement('td');
                td.addEventListener('click', function (evt) {
                    console.log(r + 'x' + c);
                });
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        return table;
    };
*/

/*
    2. How would you rewrite this to use event delegation? You can add any attributes to the cells that you wish
    to achieve the task.
    Tim's Notes: I gave this a stronger rewrite than just adding in event delegation. Unless I'm catering to very
    old browsers, I prefer to use Array functions which have clearer scopes than for loops, which helps prevent the
    var hoisting issues mentioned in 1.
*/

exports.makeDelegatedTable = (numRows, numColumns) => {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    [...new Array(numRows)].forEach((ignore, rowIndex) => {
        const rowEl = document.createElement('tr');
        [...new Array(numColumns)].forEach((ignore, colIndex) => {
            const colEl = document.createElement('td');
            colEl.dataset.row = rowIndex.toString();
            colEl.dataset.col = colIndex.toString();
            rowEl.appendChild(colEl);
        });
        tbody.appendChild(rowEl);
    });
    table.appendChild(tbody);

    table.addEventListener('click', function (evt) {
        const el = evt?.target;
        if(el?.nodeName?.toLowerCase?.() === 'td') {
            console.log(el.dataset.row + 'x' + el.dataset.col);
        }
    });
    return table;
}

/*
    3. What are the advantages of event delegation? What are the disadvantages?

    Tim's Notes: The advantage is that you only need to manage one function in one place to handle any number of
    descendent elements. This makes it much easier to toggle on and off, and much less upkeep for the browser to manage
    dozens of event handlers.

    The downside is that _every_ click warrants processing time, even the ones on things you don't care about.
    Furthermore, if you have complex actions based on the specific element you clicked relative to the others,
    you require some way to differentiate that, and that usually means data attributes and maintaining a dictionary,
    which is a different set of issues in and of itself, and if handled poorly, could mean security vulnerabilities as
    someone changes a data attribute and gets access to data they shouldn't be allowed to.
 */