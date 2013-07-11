$(document).ready(function() {
    
    function submit() {
        var colors = {
            "pink":"rgba(255,192,203,1)",
            "magenta":"rgba(255,0,255,1)",
            "red":"rgba(255,0,0,1)",
            "darkorange":"rgba(255,140,0,1)",
            "yellow":"rgba(255,255,0,1)",
            "lime":"rgba(0,255,0,1)",
            "darkgreen":"rgba(0,100,0,1)",
            "olive":"rgba(128,128,0,1)",
            "aqua":"rgba(0,255,255,1)",
            "darkcyan":"rgba(0,139,139,1)",
            "darkblue":"rgba(0,0,139,1)",
            "purple":"rgba(128,0,128,1)",
            "maroon":"rgba(128,0,0,1)",
            "darkgrey":"rgba(169,169,169,1)",
        };
        
        function randomColor(opacity) {
            var result;
            var count = 0;
            for (var prop in colors)
                if (Math.random() < 1/++count)
                   result = prop;
            var output = colors[result].replace('1)',opacity+')');
            delete colors[result];
            return output;
        }
        
        var jsonThing = {};
        jsonThing['specs'] = {}
        $('.specs div').each(function () {
            var name = $(this).find('.name').val();
            jsonThing['specs'][name] = {};
            
            if ($(this).find('.contains').val() !== "") {
                jsonThing['specs'][name]['contains'] = $(this).find('.contains').val().split(/[\s,]+/);
            }
            else {
                jsonThing['specs'][name]['contains'] = [];
            }
            
            if ($(this).find('.intersects').val() !== "") {
                jsonThing['specs'][name]['intersects'] = $(this).find('.intersects').val().split(/[\s,]+/);
            }
            else {
                jsonThing['specs'][name]['intersects'] = [];
            }
            
            jsonThing['specs'][name]['text'] = $(this).find('textarea').val();
            jsonThing['specs'][name]['color'] = randomColor(0.3);
            
        });
        
        jsonThing['imples'] = {};
        $('.imple div').each(function() {
            var name = $(this).find('.name').val();
            jsonThing['imples'][name] = {};
            jsonThing['imples'][name]['text'] = $(this).find('textarea').val();
            jsonThing['imples'][name]['color'] = randomColor(1);
        });
        
        $("#result").text(JSON.stringify(jsonThing));
        
    }
    
    var counterspec = 1; 
    var counterimple = 1;

    function addSpec() {
        console.log("here");
        counterspec += 1; 
        var spec = $("<div style='margin-right: 5px;' class='spec" + counterspec +  "'><span><input class='name' style='width:78px; margin-right: 4px;' type='text' placeholder='Spec name...'><input class='intersects' style='width:78px; margin-right: 4px;' type='text' placeholder='Intersections'><input class='contains' style='width:78px' type='text' placeholder='Contains'></span><br><textarea class='input-xlarge' rows='4' placeholder='Enter spec...'></textarea><br><br></div>");
        $(".specs").append(spec);
    }
    
        
    function decSpec() {
        $(".spec" + counterspec).remove();
        counterspec -= 1;
        
        
    }
    
    function addImple() {
        counterimple += 1;
        var imple = $('<div class="imple' + counterimple + '">' +
                    '<input class="name span6" type="text" placeholder="Implementation name..."><br>' +
                    '<textarea class="span6" style="height: 200px" placeholder="Enter implementation"></textarea>' +
                '</div>');
        $(".imple").append(imple);     
    }
    
    function decImple() {
        $(".imple" + counterimple).remove();
        counterimple -= 1;  
    }
    
    $(".add").on('click', addSpec);
    $(".dec").on('click', decSpec);
    
    $(".addi").on('click', addImple);
    $(".deci").on('click', decImple);
    $("button[type='submit']").on('click', submit);
});