'use strict';

app.controller('SignupCtl', function($scope, $http, $state, $rootScope){
	$scope.submitSignup = function(){
		$http.post('/signup', {
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