var serverURL = 'http://localhost:8080';

var allStudentAnswers, currentTab = 0, open = true, selected = [];

var canvas = new fabric.Canvas('canvas');
var chart = $('.chart');
chart.highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        height: 450,
        width: 450
    },
    title: {
        text: 'Distribution of student answers'
    },
    tooltip: {
        headerFormat: '',
        pointFormat: '<b>{point.percentage:.1f} %</b>'
    },
    plotOptions: {
        pie: {
            allowPointSelect: true,
            dataLabels: {
                enabled: true,
                format: '<b>{point.y}</b>'
            }
        }
    },
    series: [{
        type: 'pie',
        name: 'Percentage',
        id: 'pie',
        data: [],
        animation: false,
        point: {
            events: {
                select: function(event) {
                    canvas.clear();
                    canvas.loadFromJSON(this.image);
                    selected[currentTab] = this.id;
                }
            }
        }
    }]
});

function getColor(wrongness) {
    if(wrongness === 0)
        return 'rgb(0,255,0)';
    if(wrongness > 0 & wrongness <= 10) {
        var scale = 200*(10-wrongness)/10;
        return 'rgb(255,'+scale+','+scale+')';
    }
    if(wrongness > 10)
        return 'rgb(255,0,0)';
}

/***********************
*
*   AJAX
*   grabs the stored answers data from the server
***********************/

function showAnswers(qNum) {
    var studentAnswers = allStudentAnswers[qNum];
    canvas.clear();
    for(s in studentAnswers) {
        var currentAnswer = studentAnswers[s];
        if(currentAnswer.correct & selected[qNum] === undefined)
            selected[qNum] = s;
        if(chart.highcharts().get(s) === null) {
            chart.highcharts().get('pie').addPoint({
                y: currentAnswer.y,
                id: s,
                image: currentAnswer.image,
                color: getColor(parseInt(currentAnswer.wrongness)),
                sliced: s === selected[qNum],
                selected: s=== selected[qNum]
            });
        }
        else {
            if(currentAnswer.y !== chart.highcharts().get(s).y)
                chart.highcharts().get(s).update(currentAnswer.y);
        }
        if(s === selected[qNum]) {
            canvas.loadFromJSON(currentAnswer.image);
        }
    }
}

//recursive server call to update answers
function getAnswers() {
    $.ajax({url: serverURL, data: {want: 'allanswers'}}).done(function(response) {
        allStudentAnswers = jQuery.parseJSON(response);
        showAnswers(currentTab);
        if(open)
            setTimeout(getAnswers, 5000);
    });
}

$.ajax({url: serverURL, data: {want: 'load'}}).done(function(response) {
    for(j in jQuery.parseJSON(response)) {
        var qNum = parseInt(j)+1;
        var newTab = $('<li id="'+j+'"><a href="#">Question '+qNum+'</a></li>');
        $('.nav').append(newTab);
        newTab.on('click', function () {
            currentTab = parseInt($(this).attr('id'));
            chart.highcharts().get('pie').setData([]);
            showAnswers(currentTab);
        });
        
        selected.push(undefined);
    }
    
    getAnswers();
});

$('#closeBtn').on('click', function () {
    if($('#closeBtn').html() === 'Close') {
        open = false;
        $.ajax({url: serverURL, data: {want: 'close'}}).done(function(response) {
            $('#closeBtn').html('Reopen');
        });
    }
    else {
        open = true;
        getAnswers();
        $.ajax({url: serverURL, data: {want: 'open'}}).done(function(response) {
            $('#closeBtn').html('Close');
        });
    }
});

$('#resetBtn').on('click', function reset() {
    $.ajax({url: serverURL, data: {want: 'reset'}}).done(function(response) {
        chart.highcharts().get('pie').setData([]);
        canvas.clear();
    });
});