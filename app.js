'use strict';

var app = angular.module('cubed', ['ngRoute', 'ui.bootstrap.datetimepicker', 'ngAnimate']);

app.directive("switchside", function() {

  var switchside = {};

  switchside.restrict = "A";

  switchside.link = function(scope, elem, attrs) {
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

  return switchside;

});

app.factory('eventFactory', function() {

  var eventFactory = {};

  eventFactory.getEvents = function(){
    var cookieValue = getCookie("events");
    if(cookieValue){
      return JSON.parse(cookieValue);
    }
    else{
      return [];
    }
  }

  eventFactory.pushEvent = function(eventObject){
    var tempEventArray = this.getEvents();
    tempEventArray.push(eventObject);
    return setCookie("events",JSON.stringify(tempEventArray)); //If the cookie has been set, return 1
  }

  eventFactory.deleteEventByIndex = function(eventIndex){
    var tempEventArray = this.getEvents();
    tempEventArray.splice(eventIndex,1);
    return setCookie("events",JSON.stringify(tempEventArray)); //If the cookie has been set, return 1
  }

  eventFactory.editEventByIndex = function(eventIndex,eventObject){
    var tempEventArray = this.getEvents();
    tempEventArray[eventIndex]=eventObject;
    return setCookie("events",JSON.stringify(tempEventArray)); //If the cookie has been set, return 1
  }

  return eventFactory;

});

app.controller('cubeController', ['$scope', 'eventFactory', function($scope, eventFactory) {
  
  var numberOfEventSides = 4;

  var compareEventsByDate = function(firstElem,secondElem){
    return new Date(firstElem.date) - new Date(secondElem.date);
  }

  $scope.cubeSide = 'cube-side'; //Initializing with the side the user sees initially
  $scope.cubeSideAnimationStyle = ''; //We will use this to animate the 'cube-side' face by giving it an animation class
  $scope.eventDisplayIndex=0;
  $scope.isInputSelected = false;
  $scope.events = eventFactory.getEvents();
  $scope.editOn = [0,0,0,0];
  //Because we use our controller to feed the ui the 4 elements instead of using an ng-repeat with the elements
  //we have to sort our array inside the controller before passing it to the ui.
  $scope.events.sort(compareEventsByDate);

  $scope.turnEditOn = function(index){
    console.log(1);
    $scope.editOn[index]=1;
    $scope.tempEvent=$scope.events[index];
  }

  $scope.turnEditOff = function(index){
    $scope.editOn[index]=0;
  }

  $scope.completeEdit = function(index){
    eventFactory.editEventByIndex(index,$scope.tempEvent);
    $scope.events = eventFactory.getEvents();
    $scope.turnEditOff(index);
  }

  $scope.deleteEvent = function(index){
    eventFactory.deleteEventByIndex(index);
    $scope.events = eventFactory.getEvents();
  }


  $scope.setInputFocus = function(value){
    $scope.isInputSelected = value;
  }

  $scope.rotateTo = function(side){

    if($scope.cubeSide=='cube-side'){  //We do this so that .ng-enter has a handler it can work on after cubeSide has changed
      switch(side){
        case 'top':
        $scope.cubeSideAnimationStyle='sideAnimateToTop';
        break;
        case 'bottom':
        $scope.cubeSideAnimationStyle='sideAnimateToBottom';
      }
    }

    $scope.cubeSide = 'cube-'+side;
    //Whenever a rotate happens, update the events (so that the newly created events are added and sorted)
    $scope.events = eventFactory.getEvents();
    $scope.events.sort(compareEventsByDate);
  }

  $scope.incrementDisplayIndex = function(){
    $scope.cubeSideAnimationStyle='sideAnimateToRight';
    $scope.eventDisplayIndex++
    if($scope.eventDisplayIndex>(numberOfEventSides-1)){
      $scope.eventDisplayIndex=$scope.eventDisplayIndex%numberOfEventSides;
    }
  }

  $scope.decrementDisplayIndex = function(){
    $scope.cubeSideAnimationStyle='sideAnimateToLeft';
    $scope.eventDisplayIndex--;
    if($scope.eventDisplayIndex<0){
      $scope.eventDisplayIndex=numberOfEventSides+$scope.eventDisplayIndex;
    }
  }

}]);

app.controller('eventCreateController', ['$scope', 'eventFactory', function($scope, eventFactory) {

  $scope.event={};
  $scope.event.title="";
  $scope.event.date="";
  $scope.event.desc="";
  $scope.success="";
  $scope.warnings="";

  $scope.setStartDateBeforeRender = function($dates) {

    var activeDate = moment().subtract(1, 'day').add(1, 'minute');

    $dates.filter(function (date){
      return date.localDateValue() <= activeDate.valueOf()
    }).forEach(function (date){
      date.selectable = false;
    });

  }

  $scope.resetFields = function(){
    $scope.event.title="";
    $scope.event.date="";
    $scope.event.desc="";
    $scope.success="";
    $scope.warnings="";
  }

  $scope.saveEvent = function(){
    if($scope.event.title&&$scope.event.desc&&$scope.event.date){
      if(eventFactory.pushEvent($scope.event)){  //Simple sync workaround to do something after the event has been pushed
        $scope.resetFields();
        $scope.success="The event has been added!";
      }
    }
    else{
      $scope.success="";
      $scope.warnings="Please complete all the fields.";
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