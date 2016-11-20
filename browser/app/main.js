'use strict';

var app = angular.module('auther', ['ui.router']);

app.config(function ($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  $urlRouterProvider.when('/auth/:provider', function(){
  	window.location.reload();
  });
});

app.run(function($http, $rootScope){
	$http.get('/me')
	.then(function(theUser){
		$rootScope.currentUser = theUser
	})
})
