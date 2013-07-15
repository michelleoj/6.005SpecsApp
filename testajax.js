var sys = require("sys"),  
my_http = require("http");

/*
the JSON strings of all the questions
*/
var questions = [
    {"specs":{"f1":{"contains":[],"intersects":["f2"],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,0,139,0.3)"},"f2":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,100,0,0.3)"},"f3":{"contains":["f4"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(169,169,169,0.3)"}},"imples":{"f4":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,255,0,1)"}}},
    {"specs":{"f1":{"contains":["f7"],"intersects":["f2","f3"],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,255,0.3)"},"f2":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,255,0,0.3)"},"f3":{"contains":[],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,139,139,0.3)"},"f4":{"contains":["f5","f6"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(128,0,0,0.3)"},"f5":{"contains":["f6"],"intersects":[],"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(0,0,255,0.3)"}},"imples":{"f6":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,255,1)"},"f7":{"text":"boolean f1(int a, int b) {...}\n@requires a, b are integers\n@effects true if equal, false otherwise","color":"rgba(255,0,0,1)"}}},
    {"specs":{"findFirst":{"contains":["findIndex"],"intersects":["findLast"],"text":"int findFirst(item, list) {...}\n@param item the element of interest\n@param list an array possibly containing item\n@returns the index of the first occurrence of item in list if it exists, -1 if it does not","color":"rgba(0,100,0,0.3)"},"findLast":{"contains":[],"intersects":["findFirst"],"text":"int findLast(item, list) {...}\n@param item the element of interest\n@param list an array possibly containing item\n@returns the index of the last occurrence of item in list if it exists, -1 if it does not","color":"rgba(169,169,169,0.3)"},"findAll":{"contains":["findFirst","findLast","findIndex"],"intersects":[],"text":"int[] findAll(item, list) {...}\n@param item the element of interest\n@param list an array possibly containing item\n@returns an array containing the indices of all occurrences of item in list","color":"rgba(128,0,0,0.3)"}},"imples":{"findIndex":{"text":"int findIndex(int item, int[] list) {\n   for(l in list) {\n      if(l == item)\n         return item.indexOf(l);\n   }\n   return -1;\n}","color":"rgba(255,255,0,1)"}}},
    {"specs":{"minA":{"contains":["min1","min3"],"intersects":["minB"],"text":"minA(list)\n// requires: list is an array of positive numbers with at least one element\n// effects: returns the smallest element in list","color":"rgba(0,0,139,0.3)"},"minB":{"contains":["min2","min3"],"intersects":["minA"],"text":"minB(list)\n// requires: list is an array of numbers in increasing order\n// effects: returns the smallest element in list, or returns -Infinity if the list is empty","color":"rgba(255,140,0,0.3)"}},"imples":{"min1":{"text":"function min1(list) {\n  var min = 0;\n  for (var i = 0; i < list.length; ++i) {\n    if (list[i] < min) min = list[i];\n  }\n  return min;\n}","color":"rgba(128,0,128,1)"},"min2":{"text":"function min2(list) {\n  if (list.length == 0) return -Infinity; else return list[0];\n}","color":"rgba(0,255,255,1)"},"min3":{"text":"function min3(list) {\n  return Math.min(list);\n}","color":"rgba(128,0,0,1)"}}}
];

/*
Stores the students' answers
*/
var studentAnswers = [
    {},{},{},{}
];

/*
Adds a new answer

@answer a string
@questionNumber a positive int
@correct a boolean
@image a JSON string
@returns a string - message detailing what was added to what
*/
function addAnswer(answer, questionNumber, correct, image) {
    if(studentAnswers[questionNumber][answer] === undefined) {
        studentAnswers[questionNumber][answer] = {};
        studentAnswers[questionNumber][answer]['y'] = 1;
        studentAnswers[questionNumber][answer]['image'] = image;
    }
    else
        studentAnswers[questionNumber][answer]['y'] += 1;
    if(correct === 'true')
        studentAnswers[questionNumber][answer]['correct'] = true;
    else
        studentAnswers[questionNumber][answer]['correct'] = false;
    return "added answer "+answer+" to question "+questionNumber;
}

var closed = false;

my_http.createServer(function(request,response){ 
    sys.puts("I got kicked");
    response.writeHeader(200, {"Content-Type": "text/plain",
                               "Access-Control-Allow-Origin": "*"});
    var data = require('url').parse(request.url, true).query;
    var answer = "invalid request";
    /***********************
    *
    *   AJAX
    *   load returns the JSON string of the questions
    *   answers returns the JSON string of the answers data for the desired question
    *   answer adds an answer to the database for the desired question
    *   close closes the quiz
    *   open opens the quiz
    *   reset resets the stored answers
    ***********************/
    var questionNumber = Math.max(0,Math.min(studentAnswers.length-1,parseInt(data.question) || 0));
    if(data.want === 'load')
        answer = JSON.stringify(questions);
    else if(data.want === 'answers')
        answer = JSON.stringify(studentAnswers[questionNumber]);
    else if(data.want === 'answer' & closed !== true)
        answer = addAnswer(data.answer, questionNumber, data.correct, data.image);
    else if(data.want === 'close')
        closed = true;
    else if(data.want === 'open')
        closed = false;
    else if(data.want === 'reset')
        studentAnswers = [{},{},{},{}];
    response.write(answer);
    response.end();  
}).listen(8000);  
sys.puts("Server Running on 8000");