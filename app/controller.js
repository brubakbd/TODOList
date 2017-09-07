angular.module('myApp', [])
.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
}])
.directive('onReadFile', ['$parse', //Directive for uploading copied from https://stackoverflow.com/questions/25652959/angular-file-upload-without-local-server
    function($parse){ 
        return {
            restrict: 'A',
            scope: false, 
            link: function(scope, ele, attrs) {

                var fn = $parse(attrs.onReadFile);
                ele.on('change', function(onChangeEvent){
                    var reader = new FileReader();

                    reader.onload = function(onLoadEvent) {
                        scope.$apply(function(){
                            fn(scope, {$fileContents: onLoadEvent.target.result} )
                        })
                    }

                    reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
                })

            }
        }
    }
])
.controller('myCtrl', ['$scope', '$timeout', function($scope, $timeout) {
    $scope.start = Date.now();
    $scope.timeMin = "0";
    $scope.timeSec = "00";
    $scope.count = 3;
    var values = {};
    var newVal = false;
    values[0] = {};
    values[0].name = 'Test1';
    values[0].value = '0';
    values[0].selected = true;
    values[0].time = 0;
    values[1] = {};
    values[1].name = 'Test2';
    values[1].value = '1';
    values[1].time = 0;
    values[2] = {};
    values[2].name = 'Test3';
    values[2].value = '2';
    values[2].time = 0;

    var change = function(){};

    $('.ui.dropdown')
    .dropdown({values: values,
        onChange: function(){change()}
    });
    change = function(){
        var cur = $('.ui.dropdown').dropdown('get value');
        // console.log(cur);
        if(!cur){
            // console.log("ASDF")
            $('.ui.checkbox').checkbox('set unchecked');
            setTime(0);
        } else if(newVal){
            // console.log("test")
            newVal = false;
            $('.ui.checkbox').checkbox('set unchecked');
            setTime(0);
        } else if(values[cur].time == 0){
            $('.ui.checkbox').checkbox('set unchecked');
            setTimeApply(0);
        } else {
            $('.ui.checkbox').checkbox('set checked');
            setTimeApply(values[cur].time);
        }
    };
    $scope.parseInputFile = function(fileText){
        // console.log(fileText);
        var lines = fileText.split('\n');
        lines.pop();
        // console.log(lines)
        var i = 0;
        var newValues = {};
        lines.forEach(function(ln){
            var vals = ln.split('|');
            // console.log(vals[0] + " " + vals[1]);
            newValues[i] = {};
            newValues[i].name = vals[0];
            var times = vals[1].split(':');
            var time = parseInt(times[0]) * 60000 + parseInt(times[1]) * 1000;
            newValues[i].time = time;
            newValues[i].value = i;
            i++;
        });
        newValues[0].selected = true;
        values = newValues;
        // console.log(values);
        $('.ui.dropdown').dropdown("change values", values);
        $('.ui.dropdown').dropdown("set selected", 0);
    }
    $scope.addVal = function(){
        var i = 0;
        var val = $('.ui.form').form('get value', 'element');
        var cur = $('.ui.dropdown').dropdown('get value');
        var newValues = {};
        $scope.count = $scope.count + 1;
        for(i; i < $scope.count; i++){
            if(i < cur){
                newValues[i] = {};
                newValues[i].name = values[i].name;
                newValues[i].value = values[i].value;
                newValues[i].time = values[i].time;
            } else if (i == cur){
                continue;
            } else {
                newValues[i] = {};
                newValues[i].name = values[i-1].name;
                newValues[i].value = ''+i;
                newValues[i].time = values[i-1].time;
            }
        }
        newValues[cur] = {};
        newValues[cur].name = val;
        newValues[cur].value = cur;
        newValues[cur].time = 0;
        newValues[cur].selected = true;
        values = newValues;
        newVal = true;
        $('.ui.dropdown').dropdown("change values", values);
    };

    $scope.removeVal = function(){
        var i = 0;
        var cur = $('.ui.dropdown').dropdown('get value');
        var newValues = {};
        $scope.count = $scope.count - 1;
        for(i; i < $scope.count; i++){
            if(i < cur){
                newValues[i] = {};
                newValues[i].name = values[i].name;
                newValues[i].value = values[i].value;
                newValues[i].time = values[i].time;
            } else if (i > cur){
                newValues[i] = {};
                newValues[i].name = values[i+1].name;
                newValues[i].value = ''+i;
                newValues[i].time = values[i+1].time;
            } else {
                newValues[i] = {};
                newValues[i].name = values[i+1].name;
                newValues[i].value = ''+i;
                newValues[i].time = values[i+1].time;
                newValues[i].selected = true;
            }
        }
        values = newValues;
        newVal = true;
        $('.ui.dropdown').dropdown("change values", values);
    };

    $scope.startTimer = function(){
        $scope.start = Date.now();
    };

    $scope.getTime = function(){
        var cur = $('.ui.dropdown').dropdown('get value');
        var time = Date.now() - $scope.start;
        if(values[cur].time == 0){
            values[cur].time = time;
            setTime(time);
        } else {
            values[cur].time = 0;
            setTime(0);
        }
            
    };

    var setTime = function(val){
        var secs = parseInt(val/1000);
        var mins = parseInt(secs/60);
        secs = secs - 60*mins;
        // $timeout(function(){
            $scope.timeMin = ""+mins
        // });
        
        if(secs < 10)
            secs = "0"+secs;
        else
            secs = ""+secs;
        // $timeout(function(){
            $scope.timeSec = secs
        // });
    };
    var setTimeApply = function(val){
        var secs = parseInt(val/1000);
        var mins = parseInt(secs/60);
        secs = secs - 60*mins;
        $scope.$apply(function(){
            $scope.timeMin = ""+mins
        });
        
        if(secs < 10)
            secs = "0"+secs;
        else
            secs = ""+secs;
        $scope.$apply(function(){
            $scope.timeSec = secs
        });
    };

    $scope.export = function(){
        var i = 0;
        var content = ""
        for(i; i<$scope.count; i++){
            var secs = parseInt(values[i].time/1000);
            var mins = parseInt(secs/60);
            secs = secs - 60*mins;
            if(secs < 10)
                secs = "0"+secs;
            else
                secs = ""+secs;

            content += values[i].name + "|" + mins + ":" + secs + "\n"
        }
        console.log(content);
        downloadFile('experimentData.txt', content);
        // console.log(content)
    };

    //Copied from stack overflow for downloading a file: https://stackoverflow.com/questions/21177078/javascript-download-csv-as-file
    function downloadFile(fileName, urlData) {
        var link = document.createElement('a');
        link.setAttribute("download", fileName);
        link.style = "visibility:hidden";

        var blob = new Blob([ urlData ], { type : 'text/plain' });
        var url = (window.URL || window.webkitURL).createObjectURL( blob );
        link.setAttribute("href", url);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        (window.URL || window.webkitURL).revokeObjectURL(blob);
    }

// var data = '"Column One","Column Two","Column Three"';
// downloadFile('2.csv', 'data:text/csv;charset=UTF-8,' + encodeURIComponent(data));

    
}]);

