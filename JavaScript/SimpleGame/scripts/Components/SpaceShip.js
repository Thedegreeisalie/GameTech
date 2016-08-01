/* global Demo */

//------------------------------------------------------------------
//
// Defines a SpaceShip component.  A Spaceship contains a sprite.
// The spec is defined as:
//	{
//		center: { x: , y: },		// In world coordinates
//		size: { width: , height: },	// In world coordinates
//		momentum: { x: , y: },		// Direction of momentum
//		rotation: 	,				// Pointing angle, in radians
//		accelerationRate: 	,		// World units per second
//		rotateRate:					// Radians per millisecond
//	}
//
//------------------------------------------------------------------
Demo.components.SpaceShip = function(spec) {
	'use strict';
	var sprite = null,
		that = {
			get type() { return Demo.components.Types.SpaceShip; },
			get center() { return sprite.center; },
			get size() { return spec.size; },
			get momentum() { return spec.momentum; },
			get rotation() { return spec.rotation; },
			get accelerateRate() { return spec.accelerateRate; },
			get damage() { return 4; },
			get sprite() { return sprite; }
		},
		boundingCircle = {
			get center() { return that.center; },
			get radius() { return that.size.width / 2; }
		};

	Object.defineProperty(that, 'boundingCircle', {
		get: function() { return boundingCircle; },
		enumerable: true,
		configurable: false
	});

	//------------------------------------------------------------------
	//
	// Update the position of the ship based on its current momentum vector,
	// then tell the underlying sprite model to also update.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		sprite.center.x += (spec.momentum.x * elapsedTime);
		sprite.center.y += (spec.momentum.y * elapsedTime);

		sprite.update(elapsedTime);

		return true;
	};

	//------------------------------------------------------------------
	//
	// Check to see if the SpaceShip collides with another entity.
	//
	//------------------------------------------------------------------
	that.intersects = function(entity) {
		return Demo.utilities.math.circleCircleIntersect(entity.boundingCircle, that.boundingCircle);
	}

	//------------------------------------------------------------------
	//
	// Called when another entity gets within the 'vicinity' of this entity.
	//
	//------------------------------------------------------------------
	that.vicinity = function(entity) {
		//
		// Nothing to do here
	};

	//------------------------------------------------------------------
	//
	// Handle the collision behavior of the SpaceShip with another entity.
	//
	//------------------------------------------------------------------
	that.collide = function(entity) {
		var keepAlive = true;
		if (entity) {
			if (entity.type === Demo.components.Types.Base) {
				//
				// If we hit a base, we are dead, that's all there is too it, just die!
				spec.hitPoints.strength = 0;
			} else {
				spec.hitPoints.strength = Math.max(spec.hitPoints.strength - entity.damage, 0);
			}
		}

		//
		// If hit points have hit 0, we are done!
		if (spec.hitPoints.strength <= 0) {
			keepAlive = false;
			//
			// Make a nice big explosion when this happens!
			Demo.components.ParticleSystem.createEffectExplosion({
				center: { x: that.center.x, y: that.center.y },
				howMany: 500
			});
		}

		return keepAlive;
	}

	//------------------------------------------------------------------
	//
	// Fire a missle from the spaceship.
	//
	//------------------------------------------------------------------
	that.fire = function(report) {
		var missile = undefined,
			x = Math.cos(that.rotation) / 1000,
			y = Math.sin(that.rotation) / 1000;

		missile = Demo.components.Missile({
			center : { x: that.center.x, y: that.center.y },
			momentum: { x: spec.momentum.x + x, y: spec.momentum.y + y },
			lifetime: 500
		});

		//
		// Report the firing of the missle back to the calling code.
		report(missile, Demo.renderer.Missile);
	};

	//------------------------------------------------------------------
	//
	// Add momentum in the direction the ship is facing.
	//
	//------------------------------------------------------------------
	that.accelerate = function(elapsedTime) {
		var vectorX = Math.cos(that.rotation),
			vectorY = Math.sin(that.rotation),
			newSpeed = 0;

		spec.momentum.x += (vectorX * elapsedTime * spec.accelerationRate);
		spec.momentum.y += (vectorY * elapsedTime * spec.accelerationRate);
		//
		// Ensure we are still at or below the max speed
		newSpeed = Math.sqrt(Math.pow(spec.momentum.x, 2) + Math.pow(spec.momentum.y, 2));
		if (newSpeed > spec.maxSpeed) {
			//
			// Modify the vector to keep the magnitude equal to the max possible speed.
			spec.momentum.x /= (newSpeed / spec.maxSpeed);
			spec.momentum.y /= (newSpeed / spec.maxSpeed);
		}

		//
		// Generate a little exhaust
		// Compute the location of the tail of the spaceship, that is where we
		// want to emit exhaust particles.
		var tail = {
			x: that.center.x - Math.cos(that.rotation) * (that.size.width / 2),
			y: that.center.y - Math.sin(that.rotation) * (that.size.height / 2)
		};
		Demo.components.ParticleSystem.createEffectExhaust({
			center: tail,
			momentum: that.momentum,
			direction: Math.PI + spec.rotation,
			spread: Math.PI / 3,
			howMany: 5
		});
	};

	//------------------------------------------------------------------
	//
	// Rotate the model to the right
	//
	//------------------------------------------------------------------
	that.rotateRight = function(elapsedTime) {
		spec.rotation += spec.rotateRate * (elapsedTime);
	};

	//------------------------------------------------------------------
	//
	// Rotate the model to the left
	//
	//------------------------------------------------------------------
	that.rotateLeft = function(elapsedTime) {
		spec.rotation -= spec.rotateRate * (elapsedTime);
	};

	//
	// Set the initial number of hit points
	spec.hitPoints.strength = spec.hitPoints.max;

	//
	// Get our sprite model
	sprite = Demo.components.Sprite({
		image: Demo.assets['spaceship'],
		spriteSize: spec.size,			// Let the sprite know about the size also
		spriteCenter: spec.center		// Maintain the center on the sprite
	});

	return that;
};
