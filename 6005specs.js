// Objects

//so that it can do inheritance

Object.create = function(proto) {
    function F() {
    }
    
    F.prototype = proto;
    
    return new F();
    
};

function inherit(child, parent) {
    var copyOfParent = Object.create(parent.prototype);
    
    //set the constructor of the copy to child's constructor
    copyOfParent.constructor = child;
    
    //set the child ojbect protype to the copy of the parent; inherits
    //everything from the parent ojbect
    child.prototype = copyOfParent;    
}

//Specs object
function Spec(name, text, color) {
    this.name = name;
    this.text = text;
    this.radius = 0;
    this.specsContained = [];
    this.specsIntersected = [];
    this.color = color;
    this.x = 0;
    this.y = 0;
}

//getters and setters
Spec.prototype = {
    constructor: Spec,
    getName: function() {
        return this.name;
    },
    getSpec: function() {
        return this.text;
    },
    getRadius: function() {
        return this.radius;
    },
    getX: function() {
        return this.x;
    },
    getY: function() {
        return this.y;
    },
    getColor: function() {
        return this.color;
    },
    contains: function(name) {
        return this.specsContained.indexOf(name) >= 0;
    },
    intersects: function(name) {
        return this.specsIntersected.indexOf(name) >= 0;
    },
    setColor: function(c) {
        this.color = c;
    },
    setText: function(t) {
        this.text = t;
    },
    setRadius: function(r) {
        this.radius = r;
    },
    setPosition: function(x, y) {
        this.x = x;
        this.y = y;
    },
    doesContain: function(name) {
        this.specsContained.push(name);
    },
    doesIntersect: function(name) {
        this.specsIntersected.push(name)
    }
    
}

// Implementation object

function Imple(name, text, color) {
    Spec.call(this, name, text, color);
}

inherit(Imple, Spec);

//------------------------------

//*************************************************
//*
//*             ----- EVENT HANDLER -----
//*
//*************************************************
function UpdateHandler() {
    var handlers = {};
    
    
    /*
    creates a new listener request
    event = event to listen to 
    callback = function to call in the case of the event
    */
    function on(event, callback) {
        var callbacks = handlers[event];
        if (callbacks === undefined) {
            callbacks = [];
        }
        callbacks.push(callback);
        handlers[event] = callbacks;
    }
    
     /*
    calls all functions that are listeners
    event = event that occured
    data = data to pass to the callback functions.
    */
    function trigger(event, data) {
        var callbacks = handlers[event];
        if (callbacks !== undefined) {
            for (var i = 0; i < callbacks.length; i += 1)
                callbacks[i](data);
        }
    }
    
    return {on: on, trigger: trigger};
}

//makes the module accessible 
var specsExercise = (function () {  
    
    //*************************************************
    //*
    //*                ----- MODEL -----
    //*
    //*************************************************
    function Model() {
        var handler = UpdateHandler();
        var specObjects = [];
        var impleObjects = [];
        var relationships = [];
        
        /*
        Places all the spec and imple objects into an array data type and sends the trigger message 'loaded'
        
        @specs array of spec objects
        @imples array of imple objects
        @rels array of relationships
        */
        function loadQuestion(specs, imples, rels) {
            specObjects.push({});
            impleObjects.push({});
            var index = specObjects.length - 1;
            for(s in specs)
                specObjects[index][specs[s].getName()] = specs[s];
            for(i in imples)
                impleObjects[index][imples[i].getName()] = imples[i];
            relationships.push(rels);
            //store the relationships
            handler.trigger('loaded', [index, specs, imples]);
        }
        
        /*
        Sets the radius and position of the object at the current question
        
        @questionNumber a positive int
        @name a string name of the spec
        @radius a positive int
        @x a positive int
        @y a positive int
        */
        function updateSpec(questionNumber, name, radius, x, y) {
            //update info for the appropriate spec
            specObjects[questionNumber][name].setRadius(radius);
            specObjects[questionNumber][name].setPosition(x, y);
        }
        
        /*
        Checks all the relationships between the objects based on current question.
        Displays hint if there is an incorrect relationship. Sends the trigger message
        'checked' when finished. 
        
        @questionNumber a positive int
        */
        function checkAnswer(questionNumber) {
            var currentSpecs = specObjects[questionNumber];
            var currentImples = impleObjects[questionNumber];
            var currentRels = relationships[questionNumber];
            var correct = true;
            var alreadyChecked= [];
            var numRels = 0;
            var hint;
            var correctRels = [];
            for(i in currentSpecs) {
                alreadyChecked.push(i+i);
                for(j in currentSpecs) {
                    if(alreadyChecked.indexOf(i+j) < 0 & alreadyChecked.indexOf(j+i) < 0) {
                        alreadyChecked.push(i+j);
                        var newRel = checkOverlap(currentSpecs[i], currentSpecs[j]);
                        if(newRel !== '') {
                            var newRelRev = checkOverlap(currentSpecs[j], currentSpecs[i]);
                            if(currentRels.indexOf(newRel) < 0 & currentRels.indexOf(newRelRev) < 0) {
                                hint = newRel;
                                correct = false;
                            }
                            else
                                correctRels.push([newRel, newRelRev]);
                            numRels++;
                        }
                    }
                }
                for(k in currentImples) {
                    var newRel = checkOverlap(currentSpecs[i], currentImples[k]);
                    if(newRel !== '') {
                        var newRelRev = checkOverlap(currentImples[k], currentSpecs[i]);
                        if(currentRels.indexOf(newRel) < 0 & currentRels.indexOf(newRelRev) < 0) {
                            hint = newRel;
                            correct = false;
                        }
                        else
                            correctRels.push([newRel, newRelRev]);
                        numRels++;
                    }
                }
            }
            if(numRels !== currentRels.length) {
                for(c in correctRels) {
                    if(currentRels.indexOf(correctRels[c][0]) < 0 & currentRels.indexOf(correctRels[c][0]) < 0)
                        hint = correctRels[c][0];
                }
                correct = false;
                if(hint === undefined)
                    hint = 'your implementation is incorrectly placed';
                else
                    hint += ' is an incorrect relationship';
            }
            handler.trigger('checked', [questionNumber, correct, hint]);
        }
        
        /*
        Updates the Imple object in the current question
        
        @questionNumber a positive int
        @name a string of the name of the imple object
        @x a positive int
        @y a positive int
        */
        function updateImple(questionNumber, name, x, y) {
            impleObjects[questionNumber][name].setPosition(x, y);
        }
        
        return {loadQuestion: loadQuestion, updateSpec: updateSpec, updateImple: updateImple, checkAnswer: checkAnswer, on: handler.on};
    }
    
    //*************************************************
    //*
    //*             ----- CONTROLLER -----
    //*
    //*************************************************
    function Controller(model) {

        /*
        Formats the questions from JSON into either a Spec object or Imple object
        
        @bigJSON the JSON string 
        */
        function loadQuestions(bigJSON) {
            for(j in bigJSON) {
                var jsonThing = bigJSON[j];
                var specs = [], imples = [], relationships = [];
                for(i in jsonThing['imples']) {
                    var currentImple = jsonThing['imples'][i];
                    imples.push(new Imple(i, currentImple['text'], currentImple['color']));
                }
                for(s in jsonThing['specs']) {
                    var currentSpec = jsonThing['specs'][s];
                    specs.push(new Spec(s, currentSpec['text'], currentSpec['color']));
                    for(o in currentSpec['contains']) {
                        var relString = s+' contains '+currentSpec['contains'][o];
                        if(relationships.indexOf(relString) < 0)
                            relationships.push(relString);
                    }
                    for(o in currentSpec['intersects']) {
                        var relString = s+' intersects '+currentSpec['intersects'][o];
                        var relStringRev = currentSpec['intersects'][o]+' intersects '+s;
                        if(relationships.indexOf(relString) < 0 & relationships.indexOf(relStringRev) < 0)
                            relationships.push(relString);
                    }
                }
                //tells model to fire the 'loaded' message
                model.loadQuestion(specs, imples, relationships);
            }
        }
        
        /*
        Triggers the event that loads the next Spec object 
        
        @questionNumber a positive int 
        @name a string
        @radius a positive int
        @x a positive int
        @y a positive int
        */
        function updateSpec(questionNumber, name, radius, x, y) {
            model.updateSpec(questionNumber, name, radius, x, y);
        }
        
        /*
        Triggers the event that loads the next Imple object 
        
        @questionNumber a positive int 
        @name a string
        @radius a positive int
        @x a positive int
        @y a positive int
        */
        function updateImple(questionNumber, name, x, y) {
            model.updateImple(questionNumber, name, x, y);
        }
        
        /*
        Triggers the check answer event
        
        @questionNumber a positive int
        */
        function checkAnswer(questionNumber) {
            model.checkAnswer(questionNumber);
        }
        
        return {loadQuestions: loadQuestions, updateSpec: updateSpec, updateImple: updateImple, checkAnswer: checkAnswer};
    }
    
    //*************************************************
    //*
    //*                ----- VIEW -----
    //*
    //*************************************************
    function View(questionNumber, div, model, controller, displayHints, dynamicChecking) {
        
        //initializing the html objects
        var vennDiagrams = $('<div class="vennDiagrams wide tall"><canvas id="c'+questionNumber+'"height="448" width="448"></canvas></div>');
        var specsDisplay = $('<div class="specsDisplay narrow tall"></div>');
        var impleDisplay = $('<div class="impleDisplay narrow short"></div>');
        var checkDisplay = $('<div class="checkDisplay wide short"></div>');
        
        var checkButton = $('<button class="btn btn-primary">Check</button>');
        checkDisplay.append(checkButton);
        checkButton.on('click', function () {
            controller.checkAnswer(questionNumber)
        });
        var correctDisplay = $('<div class="alert alert-success">Correct!</div>');
        var wrongDisplay = $('<div class="alert alert-error">Wrong.</div>');
        checkDisplay.append(correctDisplay, wrongDisplay);
        
        /*
        Displays the feedback and hints based on the user's answers
        
        @data the user's test questions containing both the specs and the implementation objects
        */
        function displayAnswer(data) {
            var correct = data[0];
            var hint = data[1];
            if(correct) {
                correctDisplay.show();
                wrongDisplay.hide();
                $('#showQuestion'+questionNumber).css({'background-color':'lightgreen','opacity':'0.5'});
            }
            else {
                if(displayHints)
                    wrongDisplay.html(hint);
                wrongDisplay.show();
                correctDisplay.hide();
                $('#showQuestion'+questionNumber).css('background-color', 'pink');
            }
        }
        
        //event listeners for when pages has loaded and when 'check' button has been clicked.
        model.on('loaded', function (data) {
            if(data[0] === parseInt(questionNumber))
                loadSpecs([data[1], data[2]]);
        });
        model.on('checked', function (data) {
            if(data[0] === questionNumber)
                displayAnswer([data[1], data[2]]);
        });
        
        div.append(vennDiagrams, specsDisplay, checkDisplay, impleDisplay);
        
        /*
        Initializes and displays the spec objects onto the canvas and keeps track of the canvas' state. 
        Initializes the feedback displays. Also displays the descriptions of the specs
        and implementation.
        
        @data the user's test questions containing both the specs and the implementation objects
        */
        function loadSpecs(data) {
            var canvas = new fabric.Canvas('c'+questionNumber);
            
            //repositions the canvas after bringing it into view
            canvas.on('after:render', function() {
                canvas.calcOffset();
            });

            $('#showQuestion'+questionNumber).on('click', function (evt) {
                setTimeout(function(){canvas.renderAll();},500);
            });
            
            //feedback
            correctDisplay.hide();
            wrongDisplay.hide();
            
            var specs = data[0];
            var imples = data[1];
            
            //create canvas objects
            for(s in specs) {
                var text1 = new fabric.Text(specs[s].getName(), {fontSize: 20, top:-10});
                var circleWidth = Math.round(Math.max(50,text1.width));
                var circle1 = new fabric.Circle({radius:circleWidth,fill: specs[s].getColor(),name: specs[s].getName()});
                var group1 = new fabric.Group([circle1, text1], {top:randomInteger(350)+48, left:randomInteger(350)+48});
                
                canvas.add(group1);
                
                var newPre = $('<pre class="prettyprint specSpan" data-id="'+specs[s].getName()+'">'+specs[s].getSpec()+'</pre>');
                specsDisplay.append(newPre);
                newPre.css('background-color', circle1.fill);
            }
            
            for(i in imples) {
                var impleCircle = new fabric.Circle({radius:10,fill: imples[i].getColor(),name: imples[i].getName(),
                                                     top:randomInteger(428)+10, left:randomInteger(428)+10});
                impleCircle.hasControls = false;
                canvas.add(impleCircle);
                
                var newPre = $('<pre class="prettyprint impleSpan" data-id="'+imples[i].getName()+'">'+imples[i].getSpec()+'</pre>');
                impleDisplay.append(newPre);
                newPre.css('background-color', impleCircle.fill.replace(',1)',',0.3)'));
            }
            
            //disable right click on canvas
            vennDiagrams[0].oncontextmenu = function () {
                return false;
            };
            
            canvas.forEachObject(function (obj) {
                //brings selected object forward, but implementation dots always on top
                obj.on('selected', function () {
                    canvas.bringToFront(obj);
                    canvas.forEachObject(function (obj2) {
                        if(obj2.name !== undefined)
                            canvas.bringToFront(obj2);
                    });
                });
                
                //only uniform scaling allowed, no rotation
                obj.lockUniScaling = true;
                obj.selectionLineWidth = 5;
                obj.hasRotatingPoint = false;
                
                //update the object's radius and position
                var point = obj.getCenterPoint();
                if(obj.name === undefined)
                    controller.updateSpec(questionNumber, obj.item(0).name, obj.getBoundingRectWidth()/2, point.x, point.y);
                else
                    controller.updateImple(questionNumber, obj.name, point.x, point.y);
                
                //dynamically update position and radius, animate bounce if dragged out of bounds
                obj.on('modified', function () {
                    var point = obj.getCenterPoint();
                    if(point.x > 448 | point.x < 0 | point.y > 448 | point.y < 0) {
                        point.x = randomInteger(350)+48;
                        point.y = randomInteger(350)+48;
                        obj.animate('left', point.x, {onChange: canvas.renderAll.bind(canvas), duration: 100});
                        obj.animate('top', point.y, {onChange: canvas.renderAll.bind(canvas), duration: 100});
                    }
                    if(obj.name === undefined)
                        controller.updateSpec(questionNumber, obj.item(0).name, obj.getBoundingRectWidth()/2, point.x, point.y);
                    else
                        controller.updateImple(questionNumber, obj.name, point.x, point.y);
                    if(dynamicChecking)
                        controller.checkAnswer(questionNumber);
                });
            });
        }
    }
    
    /*
    Sets up the module 
    @div a div object of where the module is to be placed
    @returns a public fuction "setup" to be invoked by the user
    */
    function setup(div) {
        var displayHints = div.attr('data-hint') === 'on';
        var dynamicChecking = div.attr('data-dynamic') === 'on';
        var model = Model();
        var controller = Controller(model);
        
        //test questions
        var testJSON = [
            {"specs":{"f1":{"contains":[],"intersects":["f2"],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,0,139,0.3)"},"f2":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,100,0,0.3)"},"f3":{"contains":["f4"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(169,169,169,0.3)"}},"imples":{"f4":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,255,0,1)"}}},
            {"specs":{"f1":{"contains":["f7"],"intersects":["f2","f3"],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,255,0.3)"},"f2":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,255,0,0.3)"},"f3":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,139,139,0.3)"},"f4":{"contains":["f5","f6"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(128,0,0,0.3)"},"f5":{"contains":["f6"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,0,255,0.3)"}},"imples":{"f6":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,255,1)"},"f7":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,0,1)"}}}
        ];
        
        var navTabs = $('<ul class="nav nav-tabs"></ul>');
        var tabContent = $('<div id="my-tab-content" class="tab-content"></div>');
        var views = [];
        
        //displays first test question on page load
        for(j in testJSON) {
            var qNum = parseInt(j)+1;
            var newTab = $('<li><a id="showQuestion'+j+'" data-toggle="tab" href="#question'+j+'tab">Question '+qNum+'</a></li>');
            navTabs.append(newTab);
            var newDiv = $('<div class="tab-pane" id="question'+j+'tab"></div>');
            if(j === '0') {
                newTab.addClass('active');
                newDiv.addClass('active');
            }
            tabContent.append(newDiv);
            var newView = View(j, newDiv, model, controller, displayHints, dynamicChecking);
            views.push(newView);
        }
        div.addClass('tabbable tabs-left');
        div.append(navTabs, tabContent);
        controller.loadQuestions(testJSON);
    }
    
    return {setup: setup};
})();

/*
A random integer restricted by the bound
@bound a positive int
@returns a random int restricted on the bound

*/
function randomInteger(bound) {
    return Math.round(Math.random()*bound);
}



/* 
Checks if one circle overlaps, contains, or is contained by the other
@spec1, @spec2 spec objects representing circles on the canvas
@returns a string identifying the relationship between spec1 and spec2
*/
function checkOverlap(spec1, spec2) {
    var x1 = spec1.getX();
    var y1 = spec1.getY();
    var r1 = spec1.getRadius();
    var x2 = spec2.getX();
    var y2 = spec2.getY();
    var r2 = spec2.getRadius();
    var distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    if (distance > (r1 + r2)) {
        return '';
    }
    else if (distance <= Math.abs(r1 - r2)) {
        if(r1 > r2)
            return spec1.getName()+" contains "+spec2.getName();
        else
            return spec1.getName()+" inside "+spec2.getName();
    }
    else {  // if (distance <= r1 + r2)
        return spec1.getName()+" intersects "+spec2.getName();
    }   
}

$(document).ready(function () {
    $('.specs').each(function () {
        specsExercise.setup($(this));
    });
});

