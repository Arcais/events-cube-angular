'use strict';

var app = angular.module('cubed', ['ngRoute', 'ngAnimate']);

app.config(function ($routeProvider){
    $routeProvider
      .when('/create', {
        templateUrl: 'partials/cube-top.html',
        controller: 'eventCreateController'
      })
      .when('/', {
        templateUrl: 'partials/cube-side.html',
        controller: 'eventViewController'
      })
      .when('/info', {
        templateUrl: 'partials/cube-bottom.html',
        controller: 'infoController'
      })
      .otherwise({
        redirectTo: '/'
      });
});


app.factory('eventFactory', function() {

    var o = {};

    o.sendHelloWorld = function(){
      return "Hello world";
    }

    return o;

});



app.controller('eventViewController', ['$scope', 'eventFactory', function($scope, eventFactory) {
    $scope.cubeSideHTMLClass = 'cube-top';
    $scope.factoryTest = eventFactory.sendHelloWorld();
}]);

app.controller('eventCreateController', ['$scope', 'eventFactory', function($scope, eventFactory) {
    $scope.cubeSideHTMLClass = 'cube-side';
    $scope.factoryTest = eventFactory.sendHelloWorld();
}]);

app.controller('infoController', ['$scope', function($scope) {
    $scope.cubeSideHTMLClass = 'cube-bottom';
}]);