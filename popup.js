var sendMessage = function(message){
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(result){
		console.log(result);
		currentTab = result[0].id;
		tabURL = result[0].url;
		chrome.tabs.sendMessage(
			currentTab, 
			message
		)
	})
}

var init = function(){
	chrome.storage.sync.get('spookyGhostStarted', function(response){

		if (response.spookyGhostStarted){
			$('.list').removeClass('hidden');
			sendMessage( { showGhosts: true } );
		}

	});
}


$(function() {

	init();


	$('.ghost-image').on('click', function(e){
		var image = $(this).attr('src');
		sendMessage({image: image});
	});

	$('.go-btn').on('click', function(e){
		var list = $('.list');

		list.toggleClass('hidden');
		sendMessage( { showGhosts: !list.hasClass('hidden') } );

		chrome.storage.sync.set({'spookyGhostStarted': !list.hasClass('hidden')}, function() {
          // Notify that we saved.
          message('Settings saved');
        });
	})
});
