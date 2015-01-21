function Point(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;	
	
	this.plus = function(point) {
		return new Point(this.x + point.x, this.y + point.y, this.z + point.z);
	};
	
	this.mul = function(scalar) {
		return new Point(scalar*this.x, scalar*this.y, scalar*this.z);
	};
	
	this.minus = function(point) {
		return this.plus(point.mul(-1));
	};
	
	this.dot = function(point) {
		return this.x*point.x + this.y*point.y + this.z*point.z
	};
	
	this.rotx = function(theta) {
		var sin = Math.sin(theta);
		var cos = Math.cos(theta);
		return new Point(
		this.x,
		this.y*cos - this.z*sin,
		this.y*sin + this.z*cos);
	};
	
	this.roty = function(theta) {
		var sin = Math.sin(theta);
		var cos = Math.cos(theta);
		return new Point(
		this.x*cos + this.z*sin,
		this.y,
		-this.x*sin + this.z*cos);
	};
	
	this.rotz = function(theta) {
		var sin = Math.sin(theta);
		var cos = Math.cos(theta);
		return new Point(
		this.x*cos - this.y*sin,
		this.x*sin + this.y*cos,
		this.z);
	};
	
}

function LorenzEq(a, b, c) {
	this.dx_dt = function(point) {
		return a*(point.y - point.x);
	};
	this.dy_dt = function(point) {
		return point.x*(b-point.z)-point.y;
	}
	this.dz_dt = function(point) {
		return point.x*point.y-c*point.z;
	}
	
	this.dt = .01;
	
	//Linear interpolation
	this.next = function(point) {
		var delta = new Point(this.dx_dt(point), this.dy_dt(point), this.dz_dt(point)).mul(this.dt);
		return point.plus(delta);
	};
	//Iterations is how far along in time you want to generate
	//Sparsity is like inverse quality
	this.makePoints = function(iterations, sparsity) {
		pArray = new Array();
		current = new Point(3,15,1);
		pArray.push(current);
		for (var i=0; i<iterations; i++) {
			current = this.next(current);
			if (i%sparsity === 0) {
				pArray.push(current);
			}
		}
		return pArray;
	};
}

myLorenz = new LorenzEq(10, 28, 8/3);

/*DatGUI params*/
var length = 2;
var sparsity = 1;
var colorspeed = .28;
var realcolorspeed = colorspeed; //ugly hack
var trace = true;
/* ----------- */

//Default lorenzPoints
var lorenzPoints;
var remake = function() {
	lorenzPoints = myLorenz.makePoints(length*100, sparsity);
	realcolorspeed = colorspeed;
}
remake();

window.onload = function() {
	var g = new GEE({fullscreen:true});
		
	var recenter = function(point) {
		var center = new Point(g.width/2, g.height/2, 0);
		return point.mul(-2*g.width/300).roty(g.frameCount*.005).rotx(g.frameCount*.0005).plus(center)
	};
	
	var chooseColor = function(k) {
		var red = parseInt(Math.sin(k)*127 + 128);
		var green = parseInt(Math.sin(k+2*Math.PI*.333)*127 + 128);
		var blue = parseInt(Math.sin(k + 2*Math.PI*.666)*127 + 128);
		return "rgb(" + red + "," + green + "," + blue + ")";
	};
	
	g.draw = function() {
		if (!trace) g.ctx.clearRect( 0, 0, g.width, g.height );
		g.ctx.strokeStyle = chooseColor(g.frameCount*Math.pow(realcolorspeed, 4));
		g.ctx.lineWidth = .5;
		connect_points(lorenzPoints);
	};

	var draw_line = function(start, end) {
		start = recenter(start);
		end = recenter(end);
		g.ctx.fillText( g.frameCount, 10, 10 );
		g.ctx.beginPath();
		g.ctx.moveTo( start.x, start.y );
		g.ctx.lineTo( end.x, end.y );
		g.ctx.stroke();
	};
	
	var connect_points = function(pArray) {
		for (var i=0; i<pArray.length-1; i++) {
			draw_line(pArray[i], pArray[i+1]);
		}
	};
	
	var gui = new DAT.GUI({
					width:250
				});
				
	gui.add(this, 'length').min(1).max(30).step(1);
	gui.add(this, 'sparsity').min(1).max(10).step(1);
	gui.add(this, 'colorspeed').min(0).max(1);
	// gui.add(this, 'remake').name('Remake');
	gui.add(this, 'trace');
	gui.add(this, 'remake').onFire(
		function(){
			g.ctx.clearRect(0,0,g.width,g.height);
			}
	);

}

