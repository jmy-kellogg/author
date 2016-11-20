'use strict';

app.controller('LoginCtl', function($scope, $http, $state, $rootScope){
	$scope.submitLogin = function(){
		$http.post('/login', {
			email: $scope.emailInput,
			password: $scope.passwordInput
		})
		.then(function(res){
			$rootScope.currentUser = res.data
		})
		.then(function(){
			$state.go('stories')
		}, function(err){
			console.log(err)
		}
	)}
})