var serverURL = 'http://localhost:8000';

var canvas = new fabric.Canvas('canvas');
var chart = $('.chart');
chart.highcharts({
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        height: 450,
        width: 600
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
/***********************
*
*   AJAX
*   grabs the stored answers data from the server
***********************/
function showAnswers(qNum) {
    $.ajax({url: serverURL, data: {want: 'answers', question: qNum}}).done(function(response) {
        //parse the array of answers
        var studentAnswers = jQuery.parseJSON(response);
        //data for graph
        var dataAnswers = [];
        var index = 0;
        canvas.clear();
        for(s in studentAnswers) {
            dataAnswers.push({});
            dataAnswers[index]['y'] = studentAnswers[s]['y'];
            //THIS IS A JSON STRING FOR FABRIC.CANVAS TO LOAD
            dataAnswers[index]['image'] = studentAnswers[s]['image'];
            if(studentAnswers[s]['correct']) {
                canvas.loadFromJSON(studentAnswers[s]['image']);
                dataAnswers[index]['sliced'] = true;
                dataAnswers[index]['selected'] = true;
            }
            index++;
        }
        //make pie chart
        chart.highcharts().get('pie').setData(dataAnswers);
    });
}

$.ajax({url: serverURL, data: {want: 'load'}}).done(function(response) {
    for(j in jQuery.parseJSON(response)) {
        var qNum = parseInt(j)+1;
        var newTab = $('<li id="'+j+'"><a href="#">Question '+qNum+'</a></li>');
        $('.nav').append(newTab);
        newTab.on('click', function () {
            showAnswers($(this).attr('id'));
        });
    }
});

$('#closeBtn').on('click', function () {
    if($('#closeBtn').html() === 'Close') {
        $.ajax({url: serverURL, data: {want: 'close'}}).done(function(response) {
            $('#closeBtn').html('Reopen');
        });
    }
    else {
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