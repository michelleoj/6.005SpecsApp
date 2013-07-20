var sys = require("sys"),  
my_http = require("http"),
fs = require("fs");

var questions = fs.readFileSync("questions.js", "utf8").replace('var questions = ','').replace('\n];','\n]');

/*
Stores the students' answers and IP addresses
*/
var studentAnswers = [];
var alreadyAnswered = [];
for(q in questions) {
    studentAnswers.push({});
    alreadyAnswered.push([]);
}

/*
Adds a new answer

@answer a string
@questionNumber a positive int
@correct a boolean
@image a JSON string
@ip a string
@returns a string - message detailing what was added to what
*/
function addAnswer(answer, questionNumber, correct, image, wrongness, ip) {
    if(alreadyAnswered[questionNumber].indexOf(ip) < 0) {
        if(studentAnswers[questionNumber][answer] === undefined) {
            studentAnswers[questionNumber][answer] = {};
            studentAnswers[questionNumber][answer]['y'] = 1;
            studentAnswers[questionNumber][answer]['image'] = image;
            studentAnswers[questionNumber][answer]['wrongness'] = wrongness;
        }
        else
            studentAnswers[questionNumber][answer]['y'] += 1;
        if(correct === 'true')
            studentAnswers[questionNumber][answer]['correct'] = true;
        else
            studentAnswers[questionNumber][answer]['correct'] = false;
        alreadyAnswered[questionNumber].push(ip);
        return ip+" added answer "+answer+" to question "+questionNumber;
    }
    return ip+" has already answered question "+questionNumber+", request denied";
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
        answer = questions;
    else if(data.want === 'answers')
        answer = JSON.stringify(studentAnswers);
    else if(data.want === 'answer' & closed !== true)
        answer = addAnswer(data.answer, questionNumber, data.correct, data.image, data.wrongness, request.connection.remoteAddress);
    else if(data.want === 'close')
        closed = true;
    else if(data.want === 'open')
        closed = false;
    else if(data.want === 'reset') {
        studentAnswers = [];
        alreadyAnswered = [];
        for(q in questions) {
            studentAnswers.push({});
            alreadyAnswered.push([]);
        }
    }
    response.write(answer);
    response.end();  
}).listen(8080);  
sys.puts("Server Running on 8080");