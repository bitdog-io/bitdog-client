angular.module('StatusUpdateModule', []).
  factory('result', ['$http', '$timeout', function ($http, $timeout) {
        var result = { status: '', data: '' };
        
        function tick() {
            
            $http({ method: 'GET', url: '/api/status/' }).
        success(function (data, status) {
                result.status = status;
                result.data = data;
                httpDone();
            }).
        error(function (data, status) {
                result.data = data;
                result.status = status;
                httpDone();
            });
            
        }
        
        function httpDone()  
        {
            $timeout(tick, 5000);
        }
 
        $timeout(tick, 1);

        return result;
    }]);

function StatusUpdateCtrl($scope, result) {
    $scope.result = result;
}