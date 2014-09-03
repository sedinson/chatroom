'use strict';

/*
	Create an imitation of localStorage if is not supported
 */
if (!window.localStorage) {
    window.localStorage = {
        getItem: function(sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) {
                return null;
            }
            return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
        },
        key: function(nKeyId) {
            return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
        },
        setItem: function(sKey, sValue) {
            if (!sKey) {
                return;
            }
            document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
            this.length = document.cookie.match(/\=/g).length;
        },
        length: 0,
        removeItem: function(sKey) {
            if (!sKey || !this.hasOwnProperty(sKey)) {
                return;
            }
            document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
            this.length--;
        },
        hasOwnProperty: function(sKey) {
            return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
        }
    };
    
    window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
}

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