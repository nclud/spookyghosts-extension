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

	if (request.showGhosts && !$('.spooky-ghost-modal').length){
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
	var modal = $('.spooky-ghost-modal');

	modal.addClass('with-active-ghost');

	if (!activeGhost.length){
		modal.append('<img class="spooky-ghost-image spooky-ghost-active" src="' + image + '"/>');
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
		height: $(document).height(),
		backgroundColor: "rgba(0,0,0,.75)"
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
				ghosts[i].ghostImage = $('<img class="spooky-ghost-image" src="' + image + '"/>').css({
					left: ghost.position.x,
					top: ghost.position.y
				});

				$('.spooky-ghost-modal').append(ghosts[i].ghostImage);

				moveGhost(ghosts[i].ghostImage);
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

function moveGhost(ghost, newGhost){
	
	var date = Date.now();
	var max = newGhost ? 0 : Math.PI * 2;
	var maxSway = random(5, 10);
	var randX = random(0, max);
	var randY = random(0, max);
	var magnitude = random(5, 20);
	var timeMagnitude = random(500,1000);

	function animate(){

		var deltaTime = Date.now() - date;
		var deltaX = magnitude * Math.sin(deltaTime / timeMagnitude + randX);
		var deltaY = magnitude * Math.sin(deltaTime / timeMagnitude + randY);

		var sway = maxSway * Math.sin(deltaTime / timeMagnitude + randX);

		ghost.css({
			transform: "translate3d(" + deltaX + "px, " + deltaY + "px, 0) rotate(" + sway + "deg)"
		})

		window.requestAnimationFrame(animate);
	}

	animate();
}


function random(min, max){
	return Math.floor(Math.random() * (max - min) + min);
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

$(window).on('click', function(e){
	var activeGhost = $('.spooky-ghost-active');

	if (activeGhost.length){
		$('.spooky-ghost-modal').removeClass('with-active-ghost');
		activeGhost.removeClass('spooky-ghost-active');

		moveGhost(activeGhost, true);

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

	