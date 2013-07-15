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
        @canvasJSON a JSON string or false
        */
        function checkAnswer(questionNumber, canvasJSON) {
            var currentSpecs = [specObjects[questionNumber],impleObjects[questionNumber]];
            var currentRels = relationships[questionNumber];
            var correct = true;
            var allRels = [];
            var statusRels = []
            for(i in currentSpecs[0]) {
                for(k in currentSpecs) {
                    for(j in currentSpecs[k]) {
                        if(i !== j) {
                            var newRel = checkOverlap(currentSpecs[0][i], currentSpecs[k][j]);
                            var newRelRev = checkOverlap(currentSpecs[k][j], currentSpecs[0][i]);
                            if(newRel.indexOf('is disjoint from') < 0 & allRels.indexOf(newRel) < 0 & allRels.indexOf(newRelRev) < 0) {
                                if(currentRels.indexOf(newRel) < 0 & currentRels.indexOf(newRelRev) < 0)
                                    correct = false;
                                allRels.push(newRel);
                            }
                            if(statusRels.indexOf(newRel) < 0 & statusRels.indexOf(newRelRev) < 0)
                                statusRels.push(newRel);
                        }
                    }
                }
            }
            if(allRels.length !== currentRels.length)
                correct = false;
            handler.trigger('checked', [questionNumber, correct, JSON.stringify(statusRels)]);
            
            /***********************
            *
            *   AJAX
            *   stores a student's answer and image on the server
            ***********************/
            if(canvasJSON !== false) {
                $.ajax({url: 'http://localhost:8000',
                        data: {want: 'answer',
                               question: String(questionNumber),
                               answer: JSON.stringify(allRels),
                               correct: String(correct),
                               image: canvasJSON
                              }
                       }).done(function(response) {
                    console.log(response);
                });
            }
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
        Triggers the event that loads or updates a Spec object 
        
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
        Triggers the event that loads or updates a Imple object 
        
        @questionNumber a positive int 
        @name a string
        @x a positive int
        @y a positive int
        */
        function updateImple(questionNumber, name, x, y) {
            model.updateImple(questionNumber, name, x, y);
        }
        
        /*
        Triggers the check answer event
        
        @questionNumber a positive int
        @canvasJSON a JSON string or false
        */
        function checkAnswer(questionNumber, canvasJSON) {
            model.checkAnswer(questionNumber, canvasJSON);
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
        var checkDisplay = $('<div class="checkDisplay wide short"></div>');
        
        var canvas;
        
        var checkButton = $('<button class="btn">Submit</button>');
        checkDisplay.append(checkButton);
        checkButton.on('click', function () {
            //submits checked answer and image to server, disables button
            controller.checkAnswer(questionNumber, JSON.stringify(canvas.toJSON()));
            $(this).prop('disabled', true);
        });
        if(dynamicChecking)
            checkButton.prop('disabled', true);
        
        //initializes the feedback displays
        var correctDisplay = $('<div class="notify correct">Correct!</div>');
        var wrongDisplay = $('<div class="notify wrong">Wrong.</div>');
        checkDisplay.append(correctDisplay, wrongDisplay);
        
        /*
        Displays feedback based on the user's answers
        
        @data contains a boolean for correctness and a string for feedback
        */
        function displayAnswer(data) {
            var correct = data[0];
            var hint = data[1];
            if(correct) {
                correctDisplay.show();
                wrongDisplay.hide();
                $('#showQuestion'+questionNumber).css({'background-color':'#dff0d8'});
            }
            else {
                if(displayHints)
                    wrongDisplay.html(hint);
                wrongDisplay.show();
                correctDisplay.hide();
                $('#showQuestion'+questionNumber).css('background-color', '#f2dede');
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
        
        //populates the view for the current question
        div.append(vennDiagrams, specsDisplay, checkDisplay);
        
        /*
        Initializes and displays the spec objects onto the canvas and keeps track of the canvas' state. 
        Also displays the descriptions of the specs and implementation.
        
        @data contains both the specs and the implementation objects for the current question
        */
        function loadSpecs(data) {
            canvas = new fabric.Canvas('c'+questionNumber);
            
            //repositions the canvas after bringing it into view
            canvas.on('after:render', function() {
                canvas.calcOffset();
            });
            $('#showQuestion'+questionNumber).on('click', function (evt) {
                setTimeout(function(){canvas.renderAll();},500);
            });
            
            //initially hides the feedback views
            correctDisplay.hide();
            wrongDisplay.hide();
            
            var specs = data[0];
            var imples = data[1];
            
            //create canvas objects
            specsDisplay.append('<pre class="label">&#9679; SPECIFICATIONS</pre>');
            var usedX = 0, usedY = 0;
            for(s in specs) {
                var text1 = new fabric.Text(specs[s].getName(), {fontFamily: 'sans-serif',fontSize: 20, top:-10});
                var circleRadius = Math.round(Math.max(70,text1.width/2+10));
                var circle1 = new fabric.Circle({radius:circleRadius,fill: specs[s].getColor(),name: specs[s].getName()});
                var group1 = new fabric.Group([circle1, text1]);
                
                /***************************************************************/
                //ATTEMPT AT ORDERING THEM SO THEY DON'T INITIALLY OVERLAP
                /***************************************************************/
                group1.set({top:usedY+group1.height/2+5, left:usedX+group1.width/2+5});
                usedX += group1.width+5;
                if(usedX > canvas.width-group1.width-10) {
                    usedX = 0;
                    usedY += group1.height+5;
                }
                
                canvas.add(group1);
                
                var newPre = $('<pre class="prettyprint specSpan" data-id="'+specs[s].getName()+'">'+specs[s].getSpec()+'</pre>');
                specsDisplay.append(newPre);
                newPre.css('border-color', circle1.fill);
            }
            
            specsDisplay.append('<pre class="label">&#9650; IMPLEMENTATIONS</pre>');
            usedX = 0;
            usedY = 0;
            for(i in imples) {
                var impleCircle = new fabric.Triangle({width:15,height:15,fill: imples[i].getColor(),name: imples[i].getName()});
                var impleText = new fabric.Text(imples[i].getName(), {fontFamily: 'sans-serif',fontSize:15, top:12});
                var impleGroup = new fabric.Group([impleText, impleCircle]);
                
                /***************************************************************/
                //ATTEMPT AT ORDERING THEM SO THEY DON'T INITIALLY OVERLAP
                /***************************************************************/
                impleGroup.set({top:canvas.height-usedY-impleGroup.height, left:canvas.width-usedX-impleGroup.width});
                usedX += impleGroup.width*2;
                if(usedX > canvas.width-impleGroup.width*2) {
                    usedX = 0;
                    usedY += impleGroup.height*2;
                }
                
                impleGroup.hasControls = false;
                canvas.add(impleGroup);
                
                var newPre = $('<pre class="prettyprint specSpan" data-id="'+imples[i].getName()+'">'+imples[i].getSpec()+'</pre>');
                specsDisplay.append(newPre);
                newPre.css('border-color', impleCircle.fill.replace(',1)',',0.3)'));
            }
            
            //disable right click on canvas
            vennDiagrams[0].oncontextmenu = function () {
                return false;
            };
            
            //keeps handles on top of the objects
            canvas.controlsAboveOverlay = true;
            //clears highlighting when nothing is selected
            canvas.on('selection:cleared', function() {
                $('.specSpan').each(function() {
                    $(this).css('background-color','#f5f5f5');
                });
            });
            
            canvas.forEachObject(function (obj) {
                
                //highlights and scrolls to the description box for the selected object
                obj.on('selected', function() {
                    var thing;
                    if(obj.item(1).name === undefined)
                        thing = obj.item(0);
                    else
                        thing = obj.item(1);
                    var specName = thing.name;
                    $('.specSpan').each(function() {
                        if($(this).attr('data-id') === specName) {
                            specsDisplay.scrollTop($(this).position().top);
                            $(this).css('background-color', thing.fill.replace(',1)',',0.3)'));
                        }
                        else
                            $(this).css('background-color', '#f5f5f5');
                    });
                });
                
                //only uniform scaling allowed, no rotation
                obj.lockUniScaling = true;
                obj.selectionLineWidth = 5;
                obj.hasRotatingPoint = false;
                
                //update the object's radius and position
                var point = obj.getCenterPoint();
                if(obj.item(1).name === undefined)
                    controller.updateSpec(questionNumber, obj.item(0).name, obj.getBoundingRectWidth()/2, point.x, point.y);
                else
                    controller.updateImple(questionNumber, obj.item(1).name, point.x, point.y);
                
                //dynamically update position and radius, animate bounce if dragged out of bounds
                obj.on('modified', function () {
                    var point = obj.getCenterPoint();
                    if(point.x > 448 | point.x < 0 | point.y > 448 | point.y < 0) {
                        point.x = randomInteger(350)+48;
                        point.y = randomInteger(350)+48;
                        obj.animate('left', point.x, {onChange: canvas.renderAll.bind(canvas), duration: 100});
                        obj.animate('top', point.y, {onChange: canvas.renderAll.bind(canvas), duration: 100});
                    }
                    if(obj.item(1).name === undefined)
                        controller.updateSpec(questionNumber, obj.item(0).name, obj.getBoundingRectWidth()/2, point.x, point.y);
                    else
                        controller.updateImple(questionNumber, obj.item(1).name, point.x, point.y);
                    //checks answer if dynamic enabled
                    if(dynamicChecking)
                        controller.checkAnswer(questionNumber, false);
                    
                    sortObjects();
                });
                
                //insertion sort the objects' z-indices based on radius - larger in back, smaller in front
                function sortObjects() {
                    var objectsSortedRadius = [];
                    var objectsUnsorted = canvas.getObjects();
                    for(o in objectsUnsorted) {
                        if(objectsSortedRadius.length === 0) {
                            objectsSortedRadius.push(objectsUnsorted[o]);
                        }
                        else {
                            var i = objectsSortedRadius.length-1;
                            while(objectsSortedRadius[i].getBoundingRectWidth() > objectsUnsorted[o].getBoundingRectWidth()
                                  & i > 0)
                                i--;
                            if(objectsSortedRadius[i].getBoundingRectWidth() > objectsUnsorted[o].getBoundingRectWidth())
                                objectsSortedRadius.splice(i,0,objectsUnsorted[o]);
                            else
                                objectsSortedRadius.splice(i+1,0,objectsUnsorted[o]);
                        }
                    }
                    for(o in objectsSortedRadius)
                        objectsSortedRadius[o].sendToBack();
                }
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
        
        var navTabs = $('<ul class="nav nav-tabs"></ul>');
        var tabContent = $('<div id="my-tab-content" class="tab-content"></div>');
        
        /***********************
        *
        *   AJAX
        *   loads the questions from the server
        ***********************/
        $.ajax({url: "http://localhost:8000", data: {want: 'load'}}).done(function(response) {
            var bigJSON = jQuery.parseJSON(response);
            
            //preloads all questions, displays first test question on page load
            for(j in bigJSON) {
                var qNum = parseInt(j)+1;
                var newTab = $('<li><a id="showQuestion'+j+'" data-toggle="tab" href="#question'+j+'tab"><strong>Question '+qNum+'</strong></a></li>');
                navTabs.append(newTab);
                var newDiv = $('<div class="tab-pane" id="question'+j+'tab"></div>');
                if(j === '0') {
                    newTab.addClass('active');
                    newDiv.addClass('active');
                }
                tabContent.append(newDiv);
                var newView = View(j, newDiv, model, controller, displayHints, dynamicChecking);
            }
            div.addClass('tabbable tabs-left');
            div.append(navTabs, tabContent);
            controller.loadQuestions(bigJSON);
        });
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
        return spec1.getName()+' is disjoint from '+spec2.getName();
    }
    else if (distance <= Math.abs(r1 - r2)) {
        if(r1 > r2)
            return spec1.getName()+" contains "+spec2.getName();
        else
            return spec2.getName()+" contains "+spec1.getName();
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

