'use strict';

var app = angular.module('cubed', ['ngRoute']);

app.directive("switchside", function() {

  var d = {};

  d.restrict = "A";

  d.link = function(scope, elem, attrs) {
    angular.element(elem).on("keydown", function(e) {

      if(!scope.isInputSelected){ //Handler so you can't move while navigating an input

       if(e.keyCode==38){ //Up Arrow
         switch(scope.cubeSide){
           case 'cube-side':
             scope.$applyAsync(scope.rotateTo('top'));
             break;
           case 'cube-bottom':
             scope.$applyAsync(scope.rotateTo('side'));
         }
       }

       if(e.keyCode==40){ //Down Arrow
         switch(scope.cubeSide){
           case 'cube-top':
             scope.$applyAsync(scope.rotateTo('side'));
             break;
           case 'cube-side':
             scope.$applyAsync(scope.rotateTo('bottom'));
         }
       }

       if(e.keyCode==39){ //Right Arrow
         if(scope.cubeSide=='cube-side'){
             scope.$applyAsync(scope.incrementDisplayIndex());
         }
       }

       if(e.keyCode==37){ //Left Arrow
         if(scope.cubeSide=='cube-side'){
             scope.$applyAsync(scope.decrementDisplayIndex());
         }
       }

      }

    });
  }

  return d;

});

app.factory('eventFactory', function() {

  var o = {};

  o.sendHelloWorld = function(){
    return "Hello world";
  }

  o.setEventDisplay = function(eventDisplayNumber){
    setCookie("eventDisplayNumber",eventDisplayNumber);
  }

  o.getEventDisplay = function(){
    var cookieValue = getCookie("eventDisplayNumber");
    if(cookieValue){
      return parseInt(cookieValue);
    }
    else{
      this.setEventDisplay(0);
      return parseInt(0);
    }
  }

  return o;

});

app.controller('cubeController', ['$scope', 'eventFactory', function($scope, eventFactory) {
  
  var numberOfEventSides = 4;

  $scope.cubeSide = 'cube-top';
  $scope.eventDisplayIndex=0;
  $scope.isInputSelected = false;

  $scope.setInputFocus = function(value){
    $scope.isInputSelected = value;
  }

  $scope.rotateTo = function(side){
    $scope.cubeSide = 'cube-'+side;
  }

  $scope.incrementDisplayIndex = function(){
    $scope.eventDisplayIndex++
    if($scope.eventDisplayIndex>(numberOfEventSides-1)){
      $scope.eventDisplayIndex=$scope.eventDisplayIndex%numberOfEventSides;
    }
  }

  $scope.decrementDisplayIndex = function(){
    $scope.eventDisplayIndex--;
    if($scope.eventDisplayIndex<0){
      $scope.eventDisplayIndex=numberOfEventSides+$scope.eventDisplayIndex;
    }
  }

}]);

app.controller('eventViewController', ['$scope', 'eventFactory', function($scope, eventFactory) {
  
  $scope.events = [];
  //parse the json n shit

}]);

app.controller('eventCreateController', ['$scope', 'eventFactory', function($scope, eventFactory) {

  $scope.event={};
  $scope.event.title="";
  $scope.event.desc="";
  $scope.event.date="";
  $scope.warnings="";

  $scope.saveEvent = function(){
    if($scope.event.title&&$scope.event.desc&&$scope.event.date){
      console.log("Event");
      console.log($scope.event);
      console.log("Saved");
      $scope.event.title="";
      $scope.event.desc="";
      $scope.event.date="";
      $scope.warnings="";
    }
    else{
      console.log("Display Warning");
    }
  }

}]);


//Museum of "Leftovers from when Angular is simply retarded and there's no efficient way to do it"
//By Dragos Paun after wasting 5 hours on something with "good practice" angular that would've taken about an hour with shittycode.
//
//
//
//
//
//A rare exhibit. Here we have angular not having a clean method to have event listeners on divs.
//"But jquery doesn't have a method either" yet you can filter out the elements you're .focus() -ing.
//"But how would that be of any use? Is there any situation where that would be useful?"
//You know, situations such as NOT WANTING IT TO REGISTER ME PRESSING THE ARROW KEYS WHEN IM TYPING IN AN INPUT INSIDE A DIV.
//Instead the easiest method is to make a directive for the input changing another directive for the side switching.
//Directive changing also needs its own directive. That's 3 directives.
//You also need to a variable in the controller to remember the isFocused value because a directive (ng-focus) can't call another directive directly.
//In order to call a directive directly from another directive you need to make another directive.
//Such a graceful and good practice MVC. <3
//
// app.directive("switchside", function() {
//   return {
//
//     restrict: "A",
//     link: function(scope, elem, attrs) {
//          angular.element(elem).on("keypress", function(e) {
//       });
//     }
//
//   }
// });
//
//P.S. I forgot to tell you but the keypress $event also doesn't allow you to use keyboard arrows. It doesn't register them. At all.
//
//
//
//
//
//
//Another fascinating exhibit: Angular re-initializing controllers on location.path(). Let me clear that up for a bit.
//Ever wanted to change the location from a controller? Fuck you.
//First of all: fuck you because you can't change the location in a factory because you need input from the user and that kinda requires a directive
//or a controller and they both have the same problem. Which problem? I'll explain a bit later.
//Second of all: fuck you because you can't change the location directly because angular doesn't reload it reactively AKA it remembers the location
//change in the scope but guess what: like an annoying teenager it ain't gon' do anything until you make it. So you have to call a function to apply it
//Third of all: remember the first two points? you thought you were done after fixing them right? HAHAHAHAHA both of them lead you to this: using the
//forced apply on location change in a controller DOES make the location change AND it re-initializes the controller. As in duplicates it. As in after
//a few route changes you end up with 50 scopes for the same controller.
//"But why don't use a factory to remember the data and then feed it to the controller? This could work even when the controller is duplicated right?"
//No, because even if the controller scope is duplicated, the logic still applies to all of the objects from all of the duplicated controllers.
//That means "something++" becomes "something+=5" after you've changed the view 4 times.
//"But can't you just delete the scope and then reinitialize it every time you change the path?"
//No, because the reinitialization isn't detected on route change and by the time you come to the point of listening to every controller and then
//filtering out which one is a duplicate and which one isn't...I think you were far better off with a single-controller app.
//
// document.addEventListener('keydown', function(e){
//   //Could've been done with switch case
//   if(e.keyCode === 38 && $scope.cubeSide==='cube-side'){ //Go up
//   console.log($scope);
//     $location.path('create');
//     $scope.$apply();
//   }
//   if(e.keyCode === 40 && $scope.cubeSide==='cube-side'){ //Go down
//   console.log($scope);
//     $location.path('info');
//     $scope.$apply();
//   }
// });