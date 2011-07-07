/* Done */
var Sm = new Samarium.Manager();

//Bind other events to Samarium
/* Done */Sm.link($(document).ready,'Dom:Ready')

Sm.link($(window).resize,'Dom:Resize');

//Other way bind events
/* Done */
$(document).ready(function(){
	var domSm = Sm.get('Dom');
	domSm.unique('loaded');
	domSm.isLoaded();// true
});

/* Done */Sm.Instances(); // [Dom]
Sm.is('Dom:loaded'); //true

/* Doneable */
Sm.when('Elastic:Initialize').then(function(){
	AppCategory.asyncAll(function(){
		var appCategorySm = Sm.get('AppCategory');
		appCategorySm.unique('loaded',{
			text : 'Loading Categories...'
		});
	});
	RepositorySkeleton.asyncAll(function(){
		var repositorySkeletonSm = Sm.get('RepositorySkeleton');
		sm.unique('loaded',{
			text : 'Loading Skeleton...'
		});
	});
	FieldType.asyncAll(function(data){
		var fieldTypeSm = Sm.get('FieldType');
		fieldTypeSm.unique('loaded',{
			text : 'Loading Data...',
			data : data
		});	
	});
	Page.asyncAll(function(){
		var pageSm = Sm.get('Page');
		pageSm.trigger('loaded',{
			text : 'Loading Page and Apps...'
		});
	});
});


/* Done */Sm.Instances(); // [Dom,AppCategory,RepositorySkeleton,FieldType,Page]
Sm.describe('FieldType'); // [created:{},loaded:{text : 'Loading Data...',data : data}]
Sm.current('FieldType'); // {status:loaded,data:{text : 'Loading Data...',data : data}}
Sm.current(); // {Dom:{status:loaded,isUnique:true},{...},{...}}
Sm.is('Page:loaded'); // 1

//Bind same function to every event
/* Doneable */
Sm.on('AppCategory:loaded','RepositorySkeleton:loaded','FieldType:loaded','Page:loaded').each(function(data){
	var loaderInfo = $('.ek-loader .loading-info p');
    var loaderBar = $('.ek-loader .loading-percent');

	loaderBar.css('width', this.resolvedPromises / this.totalPromises + '%');
	loaderInfo.text(data.text);
}).then(function(){
	loaderBar.css('width', '100%');
	loaderInfo.text('Rendering, please wait...');
});

//Bind a function after all this events are completed
//after and when are diferent
//after uses set time out 0
/*
Sm.after('AppCategory:loaded','RepositorySkeleton:loaded','FieldType:loaded','Page:loaded').then(function(data){
	initializeShelf();
});
*/

//Bind a function to to an event, and unbinds after the events happends
/* Done */
Sm.once('elastic:refresh').then(function(){
	
});

//Bind a function when a event happend in a particular browser
/*
Sm.when('elastic:refresh@msie').then(function(){
	$('#content_admin').parent().css('width', $('#content_admin').parent().width() - 1);
});
*/

//Listen to any dom events
Sm.any('Dom').then(function(){
	
});

//Listen to all events in the app, just for debbugin purposes
//Should give a data about the event that trigger it...
//Maybe return a time since the start of the Samarium Manager...
Sm.all().then(function(){
	
});

//Bind a asyng loop to an event
// Move to a async library
/*
Sm.each([SomeApps],function(promise){
	//do some async
	promise.resolve();
}).when(function(){
	//Do something else
});
*/

Sm.when('Render:loaded').then(function(){
    App.all({}, function(data){
        Sm.set('App.all', 'loaded', data);
    });
});

Sm.when('Dom:loaded').then(function(){
    RepositoryApp.all({}, function(data){
        Sm.set('RepositoryApp.all', 'loaded', data);
    });
});

Sm.when('Dom:loaded').then(function(){
    InstallationRepositoryApp.all({}, function(data){
        Sm.set('InstallationRepositoryApp.all', 'loaded', data);
    });
});

Sm.when('App.all:loaded', 'RepositoryApp.all:loaded').then(function(){
    Breezi.Renderer.AppStore.render( Sm.get('RepositoryApp.all'), targetElement, function(){
       Sm.set('shelf.appStore', 'rendered'); 
    });
});

Sm.when('shelf.appStore:rendered', 'page:loaded').then(function(){
    CrossFrame.get('client').clientRunner.run(function(){
        Sm.set('clientRunner', 'ran');
    });
});

Sm.set('Dom', 'loaded');