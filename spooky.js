var image;
var Ghost = {
	ghostSrc: null,
	position: {},
	url: document.URL
};

var rootUrl = "http://localhost:3000";

//listen for popup click to start extension
chrome.runtime.onMessage.addListener( function(request, sender, response){
	if (request.image){
		Ghost.ghostSrc = request.image;
		image = chrome.extension.getURL(request.image);
		createGhost(image);
	}

	if (request.showGhosts){
		showGhosts();
	} else if (request.showGhosts === false) {
		hideGhosts();
	}
});

function init(){
	chrome.storage.sync.get('spookyGhostStarted', function(response){

		if (response.spookyGhostStarted){
			showGhosts();
		}
	});
}

function createGhost(image){
	window.focus();
	var activeGhost = $('.spooky-ghost-active');

	if (!activeGhost.length){
		$('.spooky-ghost-modal').append('<img class="spooky-ghost-image spooky-ghost-active" src="' + image + '"/>');
	} else {
		activeGhost.attr('src', image);
	}
}


function makeGhostModal(){
	var modal = $('.spooky-ghost-modal');

	if (!modal.length){
		$('body').append('<div class="spooky-ghost-modal"></div>');
	}

	$('.spooky-ghost-modal').css({
		height: $(document).height()
	});
}


function showGhosts(){
	makeGhostModal();

	$.ajax({
		method: "get",
		url: rootUrl + '/getspooked/' + encodeURIComponent(document.URL),
		contentType: "application/json",
		success: function (data) {
			var ghosts = data.ghosts;
			
			for (var i = 0; i < ghosts.length; i++){
				var ghost = ghosts[i];
				var image = chrome.extension.getURL(ghost.ghostSrc);
				var ghostImage = $('<img class="spooky-ghost-image" src="' + image + '"/>').css({
					left: ghost.position.x,
					top: ghost.position.y
				});
				$('.spooky-ghost-modal').append(ghostImage);
			}
		},
		error: function(error){
			console.log(error)
		}
	});
}

function hideGhosts(){
	$('.spooky-ghost-modal').remove();
}

$(window).on('mousemove', function(e){
	var activeGhost = $('.spooky-ghost-active');
	Ghost.position.x = (e.pageX - activeGhost.outerWidth() / 2) / window.innerWidth * 100 + '%';
	Ghost.position.y = e.pageY / $(document).height() * 100 + '%';

	$('.spooky-ghost-active').css({
		top: Ghost.position.y,
		left: Ghost.position.x
	});
});

$(window).on('resize', function(){
	$('.spooky-ghost-modal').css({
		height: $(document).height()
	});
})

$('body').on('click', function(e){

	var activeGhost = $('.spooky-ghost-active');

	if (activeGhost.length){
		activeGhost.removeClass('spooky-ghost-active');

		Ghost.url = document.URL;

		$.ajax({
			method: "post",
			url: rootUrl + '/ghostpost',
			data: JSON.stringify(Ghost),
			contentType: "application/json",
			success: function (data) {
				console.log(data);
				// if (data === true){
				// 	$('.errors').html('');
				// 	chrome.runtime.sendMessage({started: true, username: username,deckURL: deckURL});
				// 	window.close();
				// } else{
				// 	throwError(data);
				// }
			},
			error: function(error){
				console.log(error)
			}
		});
	}
});

init();

	