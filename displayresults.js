var serverURL = 'http://localhost:8080';

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
var allStudentAnswers, currentTab = 0, open = true;

function showAnswers(qNum) {
    var studentAnswers = allStudentAnswers[qNum];
    //translate answers into data for graph
    var dataAnswers = [];
    var index = 0;
    canvas.clear();
    for(s in studentAnswers) {
        dataAnswers.push({});
        dataAnswers[index]['y'] = studentAnswers[s]['y'];
        //THIS IS A JSON STRING FOR FABRIC.CANVAS TO LOAD
        dataAnswers[index]['image'] = studentAnswers[s]['image'];
        dataAnswers[index]['color'] = getColor(parseInt(studentAnswers[s]['wrongness']));
        if(studentAnswers[s]['correct']) {
            canvas.loadFromJSON(studentAnswers[s]['image']);
            dataAnswers[index]['sliced'] = true;
            dataAnswers[index]['selected'] = true;
        }
        index++;
    }
    //make pie chart
    chart.highcharts().get('pie').setData(dataAnswers);
}

//recursive server call to update answers
function getAnswers() {
    $.ajax({url: serverURL, data: {want: 'answers'}}).done(function(response) {
        allStudentAnswers = jQuery.parseJSON(response);
        showAnswers(currentTab);
        if(open)
            setTimeout(getAnswers, 1000);
    });
}

$.ajax({url: serverURL, data: {want: 'load'}}).done(function(response) {
    for(j in jQuery.parseJSON(response)) {
        var qNum = parseInt(j)+1;
        var newTab = $('<li id="'+j+'"><a href="#">Question '+qNum+'</a></li>');
        $('.nav').append(newTab);
        newTab.on('click', function () {
            currentTab = parseInt($(this).attr('id'));
        });
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