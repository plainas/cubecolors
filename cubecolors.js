function sketchProc(processing) {
  
	processing.height=450;
	processing.width=500;
	
	var state = x = y = z = 0;
	var pxaxisX, pxaxisY, pyaxisX, pyaxisY, mX, mY, Z, zaxisY;	
	var firstcube, lastcube;
	var cubes;
	var linetoZ1 = {};	
	var deactivateclick = false;
	var safefirstcube  = safelastcube = true;	
  
	processing.draw = function() {

		processing.background(50);
		processing.stroke(0,156,255);
		processing.strokeWeight(3);
		processing.line(250,0,250,220);
		processing.line(250,220,66,330);
		processing.line(250,220,433,330);
		
		processing.strokeWeight(1);
		processing.stroke(0,255,156);
		
		if(state == 0 || state == 2){
			if(processing.mouseX>250){
				zaxisY = -(processing.mouseX-250)*(3/5)+processing.mouseY;
			}else{
				zaxisY = -(250-processing.mouseX)*(3/5)+processing.mouseY;
			}
			
			//ajustar estes valores
			if(zaxisY>220 ||zaxisY<10 || processing.mouseX < 50 || processing.mouseX > 450){
				deactivateclick = true;	
			}else{
				deactivateclick = false;
				linetoZ1.x1= 250;
				linetoZ1.y1= zaxisY;
				linetoZ1.x2= processing.mouseX;
				linetoZ1.y2= processing.mouseY;
			}
			if(linetoZ1.x1 != undefined){
				processing.line(linetoZ1.x1,linetoZ1.y1,linetoZ1.x2,linetoZ1.y2);
			}
			if(state == 2){
				draw_cube(firstcube);
				
			}
		}

		else if(state == 1){
			if(safefirstcube){
				//just an ugly hack to make sure we get a cube drawn
				firstcube = makeCube(processing.mouseX,processing.mouseY,z);
				safefirstcube = false;
			}
			var cc = makeCube(processing.mouseX,processing.mouseY,z);
			if( cc.x>=0 && cc.y>=0 && cc.z>=0 && cc.x<=200 && cc.y<=200 && cc.z<=200){
				firstcube = cc;
			}
			draw_cube(firstcube);
			fillsinglecolor(reduce(firstcube.x),reduce(firstcube.y),reduce(firstcube.z));
		}
		
		else if(state == 3){
			restorecolors();
			cubes = [];
			if(safelastcube){
				lastcube = makeCube(processing.mouseX,processing.mouseY,z);
				safelastcube = false;
			}
			var cc = makeCube(processing.mouseX,processing.mouseY,z);
			if( cc.x>=0 && cc.y>=0 && cc.z>=0 && cc.x<=200 && cc.y<=200 && cc.z<=200){
				lastcube = cc;
			}
			cubes = [];
			var intermediatecubes = generate_intermediate_cubes(firstcube,lastcube);			
			cubes.push(firstcube);
			cubes = cubes.concat(intermediatecubes.reverse());
			cubes.push(lastcube);

			for(var i=0;i<cubes.length;i++){
				draw_cube(cubes[i]);
				paintsamplearea(i,reduce(cubes[i].x),reduce(cubes[i].y),reduce(cubes[i].z));
			}
			
		}
		
		else if(state==4){
			for(var i=0;i<cubes.length;i++){
				draw_cube(cubes[i]);
			}
			deactivateclick = true;
		}
			
		function draw_cube(cube){
			processing.stroke(reduce(cube.x),reduce(cube.y),reduce(cube.z));
			processing.line(cube.vertixX, cube.vertixY,cube.vertixX, cube.vertixY+cube.z);
			processing.line(cube.vertixX, cube.vertixY + cube.z, cube.pxaxisX, cube.pxaxisY);
			processing.line(cube.vertixX, cube.vertixY, cube.pxaxisX, cube.pxaxisY - cube.z);
			processing.line(cube.pxaxisX, cube.pxaxisY, cube.pxaxisX, cube.pxaxisY - cube.z);
			processing.line(cube.pxaxisX, cube.pxaxisY - cube.z, 250, 220 - cube.z);
			processing.line(cube.vertixX, cube.vertixY + cube.z, cube.pyaxisX, cube.pyaxisY);
			processing.line(cube.vertixX, cube.vertixY, cube.pyaxisX, cube.pyaxisY - cube.z);
			processing.line(cube.pyaxisX, cube.pyaxisY, cube.pyaxisX, cube.pyaxisY - cube.z);
			processing.line(cube.pyaxisX, cube.pyaxisY - cube.z, 250, 220 - cube.z);
			processing.line(cube.pxaxisX, cube.pxaxisY, 250,220);
			processing.line(cube.pyaxisX, cube.pyaxisY, 250,220);
			processing.line(250,220-cube.z,250,220);
		}
		
		/*VERY HACKY, replace with something proper?*/
		function makeCube(mX,mY,quota){
			var cube = {};
			cube.pxaxisX = -58.3 + 0.5*mX + 0.83*mY + 0.83*quota;
			cube.pxaxisY = 35 + 0.3*mX + 0.5*mY + 0.5*quota;
			cube.pyaxisX = 308 + 0.5*mX - 0.83*mY - 0.83*quota;
			cube.pyaxisY = 185 - 0.3*mX + 0.5*mY + 0.5*quota;
			cube.vertixX = mX;
			cube.vertixY = mY;
			cube.x = processing.dist(mX, mY + z, cube.pyaxisX, cube.pyaxisY);
			cube.y = processing.dist(mX, mY, cube.pxaxisX, cube.pxaxisY - quota);
			if((mY+z)<cube.pxaxisY){cube.y=-1*cube.y;}
			if((mY+z)<cube.pyaxisY){cube.x=-1*cube.x;}
			cube.z = quota;
			return cube;
		}
		
		function makeCubeFromXYZ(x,y,z){
			var factorx = 1; if(x<0){factorx=-1;}
			var factory = 1; if(y<0){factory=-1;}
			var cube = {};
			cube.x = x;
			cube.y = y;
			cube.z = z;
			cube.pyaxisX = 250 + 0.86*x; //cos(arctan(3/5))
			cube.pyaxisY = 220 + 0.51*x; //sin(arctan(3/5))
			cube.pxaxisX = 250 - 0.86*y;
			cube.pxaxisY = 220 + 0.51*y;
			cube.vertixX = cube.pyaxisX + cube.pxaxisX -250;
			cube.vertixY = cube.pyaxisY + cube.pxaxisY -220 -z;
			return cube;
			
		}
		
		function intermediatePoints(x1,y1,z1,x2,y2,z2,amount){
			if(amount <1){return [];}			
			var points = [];			
			pacex = (x1-x2) / (amount +1);
			pacey = (y1-y2) / (amount +1);
			pacez = (z1-z2) / (amount +1);			
			for(var i=1;i<=amount; i++){
				point = {};
				point.x = x2 + pacex*i;
				point.y = y2 + pacey*i;
				point.z = z2 + pacez*i;
				points.push(point);
			}
			return points;		
		}
		
		
		function generate_intermediate_cubes(scube,fcube){
			var icubes = [];
			var cubespoints = intermediatePoints(scube.x,scube.y,scube.z, fcube.x,fcube.y,fcube.z, 6);
			for(var i=0; i< cubespoints.length; i++){
				var c = cubespoints[i];
				icubes.push(makeCubeFromXYZ(c.x,c.y,c.z));
			}
			return icubes;
		}
		
		function reduce(n){
			return Math.abs(n%256)*256/200;
		}

	};
	
	processing.mouseClicked = function() {
		if(deactivateclick){
			return false;
		}
		if(state == 0 || state == 2){
			z = 220-zaxisY;
		} 
		state += 1;
		state = state % 5; 
	};
}


function convertotohex(r,g,b){
	r = Math.floor(r).toString(16).length == 1 ? '0'+ Math.floor(r).toString(16) : Math.floor(r).toString(16);  
	g = Math.floor(g).toString(16).length == 1 ? '0'+ Math.floor(g).toString(16) : Math.floor(g).toString(16);
	b = Math.floor(b).toString(16).length == 1 ? '0'+ Math.floor(b).toString(16) : Math.floor(b).toString(16);
	var colorcode =  "#" + r + g + b;
	return colorcode;

}

function paintsamplearea(areaid, r,g,b){
	var id = "fccolor" + (areaid+1);
	var labelid = "fccolor" + (areaid+1) + "code";
	var colorcode = convertotohex(r,g,b);
	document.getElementById(id).style.background = colorcode;
	document.getElementById(labelid).innerHTML = colorcode;
}

var canvas = document.getElementById("funkycube");
var processingInstance = new Processing(canvas, sketchProc);

var colorsdivcontet = document.getElementById("colorsdiv").innerHTML;
document.getElementById("colorsdiv").innerHTML = '<div style="width:300px;margin-top:100px;">Click the area on the left to start creating a colorscheme.</div>';

function restorecolors(){
	document.getElementById("colorsdiv").innerHTML = colorsdivcontet;
}


function fillsinglecolor(r,g,b){
	var firstcolor = convertotohex(r,g,b);
	document.getElementById("colorsdiv").innerHTML = '<table><tr><td><div id="fccolor1" class="sample" style="background:'+firstcolor+'"><img src="cubeframe.png"/></div><div id="fccolor1code" class="rgbcode">'+firstcolor+'</div></td></table>';
}

function fillcsstextarea(){
	var csstext = '';
	for(var i=1; i<=6; i++){
		var code = document.getElementById('fccolor' + i + 'code').innerHTML;
		csstext += '.ccfolor' + i + '{ color:' + code + ' }\n';
		csstext += '.ccbgolor' + i + '{ background-color:' + code + ' }\n';
	}
	document.getElementById('cssta').innerHTML = csstext;	
}

function displaycss(){
	fillcsstextarea();
	document.getElementById('overlay').style.display = '';	
	document.getElementById('modal').style.display = '';
	document.getElementById('modalcontent').style.display = '';
	document.getElementById('modal').style.left = (window.innerWidth - 384) / 2;
	
	document.getElementById('cssta').focus();
	document.getElementById('cssta').select();	
}

function hidecss(){
	document.getElementById('overlay').style.display = 'none';	
	document.getElementById('modal').style.display = 'none';
	document.getElementById('modalcontent').style.display = 'none';
	
}

document.getElementById('overlay').style.display = 'none';	
document.getElementById('modal').style.display = 'none';
document.getElementById('modalcontent').style.display = 'none';
