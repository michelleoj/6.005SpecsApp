6.005SpecsApp
=============
A web application that allows students in 6.005 to practice creating adequate specifications for their implementations. 

Libraries
=========
jQuery, jQueryUI, Bootstrap, Bootbox, Prettify, Fabric.js, Highcharts, Node.js

Instructors
===========
Use JSONEditor.html to generate specs/impls matching questions. When finished, paste the assembled JSON into questions.js, within the array 'questions'. (KEEP THE FORMAT OF THE ARRAY DECLARATION, INCLUDING THE NEWLINE BEFORE THE CLOSING SQUARE BRACKET.)

Embedding
---------
To embed this applet, load appropriate files (detailed below) into the same folder as your webpage, minus 6005specs.html.  
Include the following code in your HTML head:  

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
        <script src="http://web.mit.edu/lu16j/www/boots/bootstrap/js/bootstrap.min.js"></script>
        <link href="http://web.mit.edu/lu16j/www/boots/bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <script src="bootbox.min.js"></script>
        <script src="prettify.js"></script>
        <script src="fabric.js"></script>
        <script src="6005specs.js"></script>
        <link href='prettify.css' rel='stylesheet' type='text/css'/>
        <link href="6005specs.css" rel="stylesheet">  

Insert the following code where you want to place the applet (alter as needed, detailed below):  

        <div class="specs" data-hint="on" data-dynamic="on"></div>
        <script src="questions.js"></script>

Deployment - Homework Mode
--------------------------
In 6005specs.html, or in the embedded code, set the "data-dynamic" attribute of div.specs to "on".  
Load the following files into an online folder:
* 6005specs.css, .js, .html
* bootbox.min.js
* fabric.js
* prettify.js, .css
* questions.js  
  
Direct students to 6005specs.html.

Deployment - Quiz Mode
----------------------
In 6005specs.html, or in the embedded code, set the "data-dynamic" attribute of div.specs to "off".  
Load the same files as above into an online folder, minus questions.js. Delete the HTML line to include questions.js.  
Make sure questions.js and specserver.js are in the same folder on your machine; run a Node.js server from specserver.js.  
Direct students to 6005specs.html, and allow students to submit answers.  
Open displayresults.html. Hit "Close" when you want to close the quiz.  
A pie chart detailing the student answers for each question will appear in a tab for each question, along with an example visualization of the selected answer.
