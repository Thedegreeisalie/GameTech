/* global Demo */

// ------------------------------------------------------------------
//
// This namespace provides the core rendering code for the demo.
//
// ------------------------------------------------------------------
Demo.renderer.core = (function() {
	'use strict';
	var canvas = null,
		context = null,
		world = {
			size: 0,
			top: 0,
			left: 0
		};

	//------------------------------------------------------------------
	//
	// Used to set the size of the canvas to match the size of the browser
	// window so that the rendering stays pixel perfect.
	//
	//------------------------------------------------------------------
	function resizeCanvas() {
		var smallestSize = 0;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		//
		// Have to figure out where the upper left corner of the unit world is
		// based on whether the width or height is the largest dimension.
		if (canvas.width < canvas.height) {
			smallestSize = canvas.width;
			world.size = smallestSize * 0.9;
			world.left = Math.floor(canvas.width * 0.05);
			world.top = (canvas.height - world.size) / 2;
		} else {
			smallestSize = canvas.height;
			world.size = smallestSize * 0.9;
			world.top = Math.floor(canvas.height * 0.05);
			world.left = (canvas.width - world.size) / 2;
		}
	}

	//------------------------------------------------------------------
	//
	// Toggles the full-screen mode.  If not in full-screen, it enters
	// full-screen.  If in full screen, it exits full-screen.
	//
	//------------------------------------------------------------------
	function toggleFullScreen(element) {
		var	fullScreenElement = document.fullscreenElement ||
								document.webkitFullscreenElement ||
								document.mozFullScreenElement ||
								document.msFullscreenElement;

		element.requestFullScreen = element.requestFullScreen ||
									element.webkitRequestFullscreen ||
									element.mozRequestFullScreen ||
									element.msRequestFullscreen;
		document.exitFullscreen =	document.exitFullscreen ||
									document.webkitExitFullscreen ||
									document.mozCancelFullScreen ||
									document.msExitFullscreen;

		if (!fullScreenElement && element.requestFullScreen) {
			element.requestFullScreen();
		} else if (fullScreenElement) {
			document.exitFullscreen();
		}
	}

	//------------------------------------------------------------------
	//
	// Clear the whole canvas to black
	//
	//------------------------------------------------------------------
	function clearCanvas() {
		context.fillStyle = '#000000';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	//------------------------------------------------------------------
	//
	// This provides initialization of the canvas.  From here the various
	// event listeners we care about are prepared, along with setting up
	// the canvas for rendering.
	//
	//------------------------------------------------------------------
	function initialize() {
		canvas = document.getElementById('canvas-main');
		context = canvas.getContext('2d');

		window.addEventListener('resize', resizeCanvas, false);
		window.addEventListener('orientationchange', function() {
			resizeCanvas();
		}, false);
		window.addEventListener('deviceorientation', function() {
			resizeCanvas();
		}, false);

		//
		// Force the canvas to resize to the window first time in, otherwise
		// the canvas is a default we don't want.
		resizeCanvas();
	}

	//------------------------------------------------------------------
	//
	// Renders the text based on the provided spec.
	//
	//------------------------------------------------------------------
	function drawText(spec) {
		context.font = spec.font;
		context.fillStyle = spec.fill;
		context.textBaseline = 'top';

		context.fillText(
			spec.text,
			world.left + spec.pos.x * world.size,
			world.top + spec.pos.y * world.size);
	}

	//------------------------------------------------------------------
	//
	// Draw a line segment within the unit world.
	//
	//------------------------------------------------------------------
	function drawLine(style, pt1, pt2) {
		context.strokeStyle = style;
		context.beginPath();
		context.moveTo(
			0.5 + world.left + (pt1.x * world.size),
			0.5 + world.top + (pt1.y * world.size));
		context.lineTo(
			0.5 + world.left + (pt2.x * world.size),
			0.5 + world.top + (pt2.y * world.size));
		context.stroke();
	}

	//------------------------------------------------------------------
	//
	// Draw a circle within the unit world.
	//
	//------------------------------------------------------------------
	function drawCircle(style, center, radius) {
		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.beginPath();
		context.arc(
			0.5 + world.left + (center.x * world.size),
			0.5 + world.top + (center.y * world.size),
			radius * world.size,
			0, 2 * Math.PI);
		context.stroke();
	}

	//------------------------------------------------------------------
	//
	// Draws a rectangle relative to the 'unit world'.
	//
	//------------------------------------------------------------------
	function drawRectangle(style, left, top, width, height) {
		//
		// 0.5, 0.5 is to ensure an actual 1 pixel line is drawn.
		context.strokeStyle = style;
		context.strokeRect(
			0.5 + world.left + (left * world.size),
			0.5 + world.top + (top * world.size),
			width * world.size,
			height * world.size);
	}

	//
	// Expose only the ability to initialize and toggle the full screen
	return {
		initialize: initialize,
		clearCanvas: clearCanvas,
		toggleFullScreen: toggleFullScreen,
		drawText: drawText,
		drawLine: drawLine,
		drawRectangle: drawRectangle,
		drawCircle: drawCircle
	};

}());
