Array.prototype.remove=function(dx) {
	if(isNaN(dx)||dx>this.length){return false;}
	for(var i=0,n=0;i<this.length;i++)
	{
		if(this[i]!=this[dx])
		{
			this[n++]=this[i]
		}
	}
	this.length-=1
}
//删除目标数组下标为dx的元素

var
	N=0,//进球数
	R = 12, //球真实半径
	Pr = 20,//球袋
	W = 736, //width
	H = 480, //high
	THICKNESS =  32, //边缘厚度
	RATE = 100, //刷新率
	F = 0.02, //摩擦力
	LOSS = 0.2; // 撞桌子的速度损失
var table, //台球案
	cueBall, //母球
	guideBall,//参考球
	speed = 12,
	timer,
	forceTimer,
	balls = [],
	movingBalls = [],
	ps = [[0,0],[W/2,0],[W,0],[0,H],[W/2,H],[W,H]],//每个球袋的位置
	hasShot = false;


window.onload = function() //HTML加载后执行
{
	table = document.getElementById("table");
	var guideBallDiv = document.createElement("div");
	guideBallDiv.className = "guide ball";
	setStyle(guideBallDiv,"display","none");
	guideBall = table.appendChild(guideBallDiv);

	cueBall = new Ball("cue",170,H/2);
	balls.push(cueBall);

	for(var i = 0; i < 5; i++) {//生成小球
		for(var j = 0; j <= i; j++)	{
			var ball = new Ball("target",520 + i*2*R, H/2 - R*i + j*2*R);
			balls.push(ball);
		}
	}
	table.addEventListener("mousemove",dragCueBall,false);//放母球
	table.addEventListener("mouseup",setCueBall,false);
}


// ball class
function Ball(type,x,y) {//球的种类，位置
	var div = document.createElement("div");
	div.className = type + " ball";
	this.elem = table.appendChild(div);
	this.type = type;
	this.x = x;
	this.y = y;
	this.angle = 0;
	this.v = 0;
	setBallPos(this.elem,x,y);
	return this;
}

function setCueBall() {
	table.removeEventListener("mousemove",dragCueBall,false);
	table.removeEventListener("mouseup",setCueBall,false);
	startShot();
}

function startShot() {
	setStyle(cueBall.elem,"display","block");
	table.addEventListener("mousemove",showGuide,false);
	table.addEventListener("mousedown",updateForce,false);
	table.addEventListener("mouseup",shotCueBall,false);
}

function dragCueBall() {
	var toX,toY;
	e =  event;
	toX = e.clientX - table.offsetLeft - THICKNESS,//线的左边
	toY = e.clientY - table.offsetTop - THICKNESS;
	toX = toX >= R ? toX : R;
	toX = toX <= 170 ? toX : 170;
	toY = toY >= R ? toY : R;
	toY = toY <= H - R ? toY : H - R;
	setBallPos(cueBall,toX,toY);
}

function shotCueBall() {
	table.removeEventListener("mousemove",showGuide,false);
	table.removeEventListener("mousedown",updateForce,false);
	table.removeEventListener("mouseup",shotCueBall,false);
	window.clearInterval(forceTimer);
	speed = document.getElementById("force").offsetWidth * 0.15;

	var fromPos = getBallPos(cueBall.elem),
		  toPos = getBallPos(guideBall),
		  angle = Math.atan2(toPos[0] - fromPos[0],toPos[1] - fromPos[1]);
	setStyle(guideBall,"display","none");
	cueBall.v = speed;
	cueBall.angle = angle;
	movingBalls.push(cueBall);
	if(N>=15) {
		alert('Congratulation!!!!!');
		location.reload();
	}
	timer = window.setInterval(roll,1000 / RATE);
}

function showGuide() {
	var toX,toY;
	e = event;
	toX = e.clientX - table.offsetLeft - THICKNESS,
	toY = e.clientY - table.offsetTop - THICKNESS;
	setBallPos(guideBall,toX,toY);
	setStyle(guideBall,"display","block")
}


function roll()//
 {
	if(movingBalls.length <= 0)
	 {
		setStyle(document.getElementById("force"),"width",80+"px");//++++解决打球后力度条不还原bug
		window.clearInterval(timer);//退出循环
		startShot();
	}
	for(var i = 0; i < movingBalls.length; i++)
	 {
		var ball = movingBalls[i],
			sin = Math.sin(ball.angle),
			cos = Math.cos(ball.angle);
		ball.v -= F;

		if(Math.round(ball.v) == 0) {
			ball.v = 0;

			movingBalls.remove(i);


			continue;



		}
		var vx = ball.v * sin,
			vy = ball.v * cos;
		ball.x += vx;
		ball.y += vy;


		if(isPocket(ball.x,ball.y)) {
			setStyle(ball.elem,"display","none");
			if(ball.type == "cue") {
					ball.v = 0;
					setBallPos(ball,170,250);//重新设置母球在线的中心  方案一
					//table.addEventListener("mousemove",dragCueBall,false);//自定义母球位置  方案二
					//table.addEventListener("mouseup",setCueBall,false);
					//window.clearInterval(timer);
			}else {
				ball.v = 0;
				for(var k = 0, l =0; k < balls.length; k++) {
					if(balls[k] != ball) {
						balls[l++] = balls[k];
					}
				}
				balls.length -= 1;
				N++;//进球加1
        var a=N;
        var d = document.getElementById('s');//获取div的节点
        d.innerHTML = a;//在div节点上显示a的值1
				//alert('score:'+N);提醒框
			}
		}

		//碰到桌子
		if(ball.x < R || ball.x > W - R) {//横方向
			ball.angle *= -1;
			//ball.angle %= Math.PI;
			ball.v = ball.v * (1 - LOSS);//动能减弱
			vx = ball.v*Math.sin(ball.angle);
			vy = ball.v*Math.cos(ball.angle);
			if(ball.x < R) ball.x = R;
			if(ball.x > W - R) ball.x = W - R;
		}
		if(ball.y < R || ball.y > H - R) {//y方向
			ball.angle = ball.angle > 0 ? Math.PI - ball.angle : - Math.PI - ball.angle ;
			ball.angle %= Math.PI;
			ball.v = ball.v * (1 - LOSS);
			vx = ball.v*Math.sin(ball.angle);
			vy = ball.v*Math.cos(ball.angle);
			if(ball.y < R) ball.y = R;
			if(ball.y > H - R) ball.y = H - R;

		}

		//	小球碰撞
		for(var j = 0; j < balls.length; j++)
		{
			var obj = balls[j];
			if(obj == ball) continue;
			var disX = obj.x - ball.x,
				disY = obj.y - ball.y,
				gap = 2 * R;
			if(disX <= gap && disY <= gap) {
				var dis = Math.sqrt(Math.pow(disX,2)+Math.pow(disY,2));
				if(dis <= gap) {//若果碰到
					//如果是静止的，则添加到数组movingBalls
					if(Math.round(obj.v) == 0)
					movingBalls.push(obj);
					//利用虚位移模拟碰撞
					ball.x -= (gap - dis)*sin;
					ball.y -= (gap - dis)*cos;
					disX = obj.x - ball.x;
					disY = obj.y - ball.y;


					// 计算角度和正余弦值
					var angle = Math.atan2(disY, disX),
						hitsin = Math.sin(angle),
						hitcos = Math.cos(angle),
						objVx = obj.v * Math.sin(obj.angle),
						objVy = obj.v * Math.cos(obj.angle);

					//旋转坐标
					var x1 = 0,
						y1 = 0,
						x2 = disX * hitcos + disY * hitsin,
						y2 = disY * hitcos - disX * hitsin,
						vx1 = vx * hitcos + vy * hitsin,
						vy1 = vy * hitcos - vx * hitsin,
						vx2 = objVx * hitcos + objVy * hitsin,
						vy2 = objVy * hitcos - objVx * hitsin;

					// 碰撞后的速度和位置
					var plusVx = vx1 - vx2;
					vx1 = vx2;
					vx2 = plusVx + vx1;

					// 将位置旋转回来
					var x1Final =0,
						y1Final = 0,
						x2Final = x2 * hitcos - y2 * hitsin,
						y2Final = y2 * hitcos + x2 * hitsin;
					obj.x = ball.x + x2Final;
					obj.y = ball.y + y2Final;


					// 将速度旋转回来
					vx = vx1 * hitcos - vy1 * hitsin;
					vy = vy1 * hitcos + vx1 * hitsin;
					objVx = vx2 * hitcos - vy2 * hitsin;
					objVy = vy2 * hitcos + vx2 * hitsin;

					//最终速度
					ball.v = Math.sqrt(vx*vx + vy*vy) ;
					obj.v = Math.sqrt(objVx*objVx + objVy*objVy);

				// 计算角度
					ball.angle = Math.atan2(vx , vy);
					obj.angle = Math.atan2(objVx , objVy);

					//break;
					dis = gap;
				}
			}
		}
		setBallPos(ball,ball.x,ball.y);
	}
 }

function isPocket(x,y) {//检查入袋
	if(y < Pr) return check(0,2);
	else if (y > H - Pr) return check(3,5);
	else return false;

	function check(m,n) {
		for(var i=m; i<=n; i++) {
			if(x >= ps[i][0] - Pr && x <= ps[i][0] + Pr) {
				var dis = Math.sqrt(Math.pow(x - ps[i][0],2) + Math.pow(y - ps[i][1],2));
				if(dis <= Pr) return true;
				else return false;	}	}}
}

function getBallPos(obj) {
	var pos = [];
	pos.push(obj.offsetLeft - THICKNESS + R);//球心坐标
	pos.push(obj.offsetTop - THICKNESS + R);
	return pos;
}

function setBallPos(ball,x,y) {
	if(ball.constructor == Ball) {
		ball.x = x;
		ball.y = y;
		ball = ball.elem;
	}
	ball.style.left = x + THICKNESS - R + "px";
	ball.style.top = y + THICKNESS - R + "px";
}

function updateForce() {
	var obj = document.getElementById("force"),
		len = 80,
		up = true;
	forceTimer = window.setInterval(update,10);

function update() {//更新条
		 if(up) setStyle(obj,"width",len+++"px");
		 else setStyle(obj,"width",len--+"px");
		 if(len > 136) up = false;
		 if(len <= 0) up = true;
	}
}

function setStyle() {
		arguments[0].style[arguments[1]] = arguments[2];
}
