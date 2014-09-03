'use strict';

/*
	Declare App module
 */
var app = angular.module(
	'chatApp', ['ng-polymer-elements']
);

/*
	Attach event to user menu button to show userList 
	when screen is small (smartphone)
 */
document.addEventListener('polymer-ready', function() {
	var navicon = document.getElementById('navicon');
	var drawerPanel = document.getElementById('drawerPanel');
	
	navicon.addEventListener('click', function() {
		drawerPanel.togglePanel();
	});
});