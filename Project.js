(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"Project_atlas_1", frames: [[0,0,1539,1972]]},
		{name:"Project_atlas_2", frames: [[0,0,1431,1810]]},
		{name:"Project_atlas_3", frames: [[0,0,1449,1753]]},
		{name:"Project_atlas_4", frames: [[0,0,1042,1946]]},
		{name:"Project_atlas_5", frames: [[0,722,1283,711],[0,0,1280,720],[0,1435,1510,536]]},
		{name:"Project_atlas_6", frames: [[967,558,940,480],[0,558,965,480],[0,0,1437,556],[676,1040,647,678],[0,1040,674,678]]},
		{name:"Project_atlas_7", frames: [[0,719,1427,252],[0,973,1427,252],[1657,1465,168,203],[1827,1465,168,203],[1657,1230,312,233],[0,0,996,428],[658,1560,168,203],[828,1560,168,203],[998,1560,168,203],[1168,1563,168,203],[1338,1563,168,203],[329,1609,168,203],[0,1610,168,203],[1508,1670,168,203],[998,0,1026,377],[658,1227,331,331],[991,1227,331,331],[1324,1230,331,331],[329,1227,327,380],[1429,847,327,381],[0,1227,327,381],[0,430,1457,287],[1758,847,220,205],[1459,379,465,466]]}
];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.currentSoundStreamInMovieclip;
	this.soundStreamDuration = new Map();
	this.streamSoundSymbolsList = [];

	this.gotoAndPlayForStreamSoundSync = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.gotoAndPlay = function(positionOrLabel){
		this.clearAllSoundStreams();
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos != null) { this.startStreamSoundsForTargetedFrame(pos); }
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		this.clearAllSoundStreams();
		this.startStreamSoundsForTargetedFrame(this.currentFrame);
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
		this.clearAllSoundStreams();
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
		this.clearAllSoundStreams();
	}
	this.startStreamSoundsForTargetedFrame = function(targetFrame){
		for(var index=0; index<this.streamSoundSymbolsList.length; index++){
			if(index <= targetFrame && this.streamSoundSymbolsList[index] != undefined){
				for(var i=0; i<this.streamSoundSymbolsList[index].length; i++){
					var sound = this.streamSoundSymbolsList[index][i];
					if(sound.endFrame > targetFrame){
						var targetPosition = Math.abs((((targetFrame - sound.startFrame)/lib.properties.fps) * 1000));
						var instance = playSound(sound.id);
						var remainingLoop = 0;
						if(sound.offset){
							targetPosition = targetPosition + sound.offset;
						}
						else if(sound.loop > 1){
							var loop = targetPosition /instance.duration;
							remainingLoop = Math.floor(sound.loop - loop);
							if(targetPosition == 0){ remainingLoop -= 1; }
							targetPosition = targetPosition % instance.duration;
						}
						instance.loop = remainingLoop;
						instance.position = Math.round(targetPosition);
						this.InsertIntoSoundStreamData(instance, sound.startFrame, sound.endFrame, sound.loop , sound.offset);
					}
				}
			}
		}
	}
	this.InsertIntoSoundStreamData = function(soundInstance, startIndex, endIndex, loopValue, offsetValue){ 
 		this.soundStreamDuration.set({instance:soundInstance}, {start: startIndex, end:endIndex, loop:loopValue, offset:offsetValue});
	}
	this.clearAllSoundStreams = function(){
		this.soundStreamDuration.forEach(function(value,key){
			key.instance.stop();
		});
 		this.soundStreamDuration.clear();
		this.currentSoundStreamInMovieclip = undefined;
	}
	this.stopSoundStreams = function(currentFrame){
		if(this.soundStreamDuration.size > 0){
			var _this = this;
			this.soundStreamDuration.forEach(function(value,key,arr){
				if((value.end) == currentFrame){
					key.instance.stop();
					if(_this.currentSoundStreamInMovieclip == key) { _this.currentSoundStreamInMovieclip = undefined; }
					arr.delete(key);
				}
			});
		}
	}

	this.computeCurrentSoundStreamInstance = function(currentFrame){
		if(this.currentSoundStreamInMovieclip == undefined){
			var _this = this;
			if(this.soundStreamDuration.size > 0){
				var maxDuration = 0;
				this.soundStreamDuration.forEach(function(value,key){
					if(value.end > maxDuration){
						maxDuration = value.end;
						_this.currentSoundStreamInMovieclip = key;
					}
				});
			}
		}
	}
	this.getDesiredFrame = function(currentFrame, calculatedDesiredFrame){
		for(var frameIndex in this.actionFrames){
			if((frameIndex > currentFrame) && (frameIndex < calculatedDesiredFrame)){
				return frameIndex;
			}
		}
		return calculatedDesiredFrame;
	}

	this.syncStreamSounds = function(){
		this.stopSoundStreams(this.currentFrame);
		this.computeCurrentSoundStreamInstance(this.currentFrame);
		if(this.currentSoundStreamInMovieclip != undefined){
			var soundInstance = this.currentSoundStreamInMovieclip.instance;
			if(soundInstance.position != 0){
				var soundValue = this.soundStreamDuration.get(this.currentSoundStreamInMovieclip);
				var soundPosition = (soundValue.offset?(soundInstance.position - soundValue.offset): soundInstance.position);
				var calculatedDesiredFrame = (soundValue.start)+((soundPosition/1000) * lib.properties.fps);
				if(soundValue.loop > 1){
					calculatedDesiredFrame +=(((((soundValue.loop - soundInstance.loop -1)*soundInstance.duration)) / 1000) * lib.properties.fps);
				}
				calculatedDesiredFrame = Math.floor(calculatedDesiredFrame);
				var deltaFrame = calculatedDesiredFrame - this.currentFrame;
				if((deltaFrame >= 0) && this.ignorePause){
					cjs.MovieClip.prototype.play.call(this);
					this.ignorePause = false;
				}
				else if(deltaFrame >= 2){
					this.gotoAndPlayForStreamSoundSync(this.getDesiredFrame(this.currentFrame,calculatedDesiredFrame));
				}
				else if(deltaFrame <= -2){
					cjs.MovieClip.prototype.stop.call(this);
					this.ignorePause = true;
				}
			}
		}
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.CachedBmp_16 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_15 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_14 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_13 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_12 = function() {
	this.initialize(ss["Project_atlas_6"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_11 = function() {
	this.initialize(ss["Project_atlas_6"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_10 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_9 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_8 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_7 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_6 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_5 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(9);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_4 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(10);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_3 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(11);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_2 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(12);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_1 = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(13);
}).prototype = p = new cjs.Sprite();



(lib.BG_full = function() {
	this.initialize(img.BG_full);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,15971,3990);


(lib.board_1 = function() {
	this.initialize(ss["Project_atlas_5"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.Car_electric = function() {
	this.initialize(ss["Project_atlas_6"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.Cheaper_1 = function() {
	this.initialize(ss["Project_atlas_1"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.end = function() {
	this.initialize(ss["Project_atlas_5"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.Faster = function() {
	this.initialize(ss["Project_atlas_2"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.Fuel_car = function() {
	this.initialize(ss["Project_atlas_5"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.Gasicon = function() {
	this.initialize(ss["Project_atlas_6"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.Greenenergyicon = function() {
	this.initialize(ss["Project_atlas_6"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.Greener = function() {
	this.initialize(ss["Project_atlas_3"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.KilometersBG = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(14);
}).prototype = p = new cjs.Sprite();



(lib.play = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(15);
}).prototype = p = new cjs.Sprite();



(lib.PlayBtn_Hover = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(16);
}).prototype = p = new cjs.Sprite();



(lib.PlayBtn_onClick = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(17);
}).prototype = p = new cjs.Sprite();



(lib.ReplayAgain = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(18);
}).prototype = p = new cjs.Sprite();



(lib.ReplayClick = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(19);
}).prototype = p = new cjs.Sprite();



(lib.ReplayHover = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(20);
}).prototype = p = new cjs.Sprite();



(lib.Scoreboard = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(21);
}).prototype = p = new cjs.Sprite();



(lib.smoke = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(22);
}).prototype = p = new cjs.Sprite();



(lib.wheel = function() {
	this.initialize(ss["Project_atlas_7"]);
	this.gotoAndStop(23);
}).prototype = p = new cjs.Sprite();



(lib.WINmedal = function() {
	this.initialize(ss["Project_atlas_4"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.Winner_car = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.wheel();
	this.instance.setTransform(34,201,0.3443,0.3481);

	this.instance_1 = new lib.wheel();
	this.instance_1.setTransform(675,200,0.3443,0.3481);

	this.instance_2 = new lib.Car_electric();
	this.instance_2.setTransform(0,0,0.6373,0.6443);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,915.8,363.2);


(lib.Tween33 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.WINmedal();
	this.instance.setTransform(-287,-535.95,0.5508,0.5508);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-287,-535.9,574,1071.9);


(lib.Tween32 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.WINmedal();
	this.instance.setTransform(-287,-535.95,0.5508,0.5508);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-287,-535.9,574,1071.9);


(lib.Tween20 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.wheel();
	this.instance.setTransform(-113.3,-0.1,0.3443,0.3443,-45);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-113.3,-113.3,226.7,226.7);


(lib.Tween19 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.wheel();
	this.instance.setTransform(-80.05,-80.2,0.3443,0.3443);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80,-80.2,160.1,160.5);


(lib.Tween16 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_16();
	this.instance.setTransform(-360.35,-258,0.5,0.5);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(412.85,333.5,0.6436,0.938,180);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-412.8,-333.4,825.7,666.9);


(lib.Tween15 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_15();
	this.instance.setTransform(-360.35,-258,0.5,0.5);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(412.85,333.5,0.6436,0.938,180);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-412.8,-333.4,825.7,666.9);


(lib.Greener_icon = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Greener();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1449,1753);


(lib.Faster_icon = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Faster();
	this.instance.setTransform(0,0,0.1992,0.1992);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,285,360.5);


(lib.Cheaper = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Cheaper_1();
	this.instance.setTransform(0,0,0.2136,0.2136);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,328.8,421.3);


(lib.Score_board = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Scoreboard();
	this.instance.setTransform(0,0,0.3445,0.3445);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,501.9,98.9);


(lib.Tween28 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_12();
	this.instance.setTransform(-230.65,-126.9,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-230.6,-126.9,470,240);


(lib.Tween26 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_11();
	this.instance.setTransform(-241.95,-97.45,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-241.9,-97.4,482.5,240);


(lib.Info_text1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_10();
	this.instance.setTransform(10.05,156.65,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_9();
	this.instance_1.setTransform(0,48.5,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,48.5,498,224.7);


(lib.StartBtn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.play();
	this.instance.setTransform(0,0,0.7153,0.7153);

	this.instance_1 = new lib.PlayBtn_Hover();
	this.instance_1.setTransform(0,0,0.7153,0.7153);

	this.instance_2 = new lib.PlayBtn_onClick();
	this.instance_2.setTransform(0,0,0.7153,0.7153);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_2}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,236.8,236.8);


(lib.Kilometers = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.text = new cjs.Text("0.0 km", "60px 'Candara'", "#FFFFFF");
	this.text.textAlign = "center";
	this.text.lineHeight = 78;
	this.text.lineWidth = 259;
	this.text.parent = this;
	this.text.setTransform(122.3,2);

	this.timeline.addTween(cjs.Tween.get(this.text).wait(107).to({text:"0.1 km"},0).wait(29).to({text:"0.2 km"},0).wait(29).to({text:"0.3 km"},0).wait(29).to({text:"0.4 km"},0).wait(29).to({text:"0.5 km"},0).wait(29).to({text:"0.6 km"},0).wait(29).to({text:"0.7 km"},0).wait(29).to({text:"0.8 km"},0).wait(29).to({text:"0.9 km"},0).wait(29).to({text:"1.0 km"},0).wait(29).to({text:"1.1 km"},0).wait(29).to({text:"1.2 km"},0).wait(29).to({text:"1.3 km"},0).wait(29).to({text:"1.4 km"},0).wait(29).to({text:"1.5 km"},0).wait(29).to({text:"1.6 km"},0).wait(67).to({_off:true},1).wait(40));

	// Layer_2
	this.instance = new lib.KilometersBG();
	this.instance.setTransform(-59,0,0.2852,0.2336);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(609).to({_off:true},1).wait(40));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-59,0,312.6,155.5);


(lib.GreenEnergy_icon = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Greenenergyicon();
	this.instance.setTransform(0,0,0.118,0.118);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,79.6,80);


(lib.Gas_icon = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Gasicon();
	this.instance.setTransform(0,0,0.118,0.118);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,76.4,80);


(lib.Gas_3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.smoke();
	this.instance.setTransform(0,34.95,0.1834,0.1834,-59.9961);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,52.8,53.8);


(lib.Gas_2 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.smoke();
	this.instance.setTransform(0,38.1,0.2448,0.2448,-44.9975);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,73.6,73.6);


(lib.Gas_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.smoke();
	this.instance.setTransform(0,23.35,0.2122,0.2122,-30.0009);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,62.2,61.1);


(lib.Tween_gas_electric = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.smoke();
	this.instance.setTransform(240.9,111.7,0.7182,0.6975,-44.9991);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(240.9,0,212.79999999999998,212.8);


(lib.Fuel_car_anticipation = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.wheel();
	this.instance.setTransform(416,109,0.1895,0.189);

	this.instance_1 = new lib.Fuel_car();
	this.instance_1.setTransform(0,0,0.3666,0.3665);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,553.5,197.1);


(lib.ReplayBtn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.ReplayAgain();
	this.instance.setTransform(0,0,0.7882,0.7883);

	this.instance_1 = new lib.ReplayHover();
	this.instance_1.setTransform(0,0,0.7882,0.7882);

	this.instance_2 = new lib.ReplayClick();
	this.instance_2.setTransform(0,0,0.7882,0.7882);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_2}]},1).to({state:[{t:this.instance_2}]},1).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,257.8,300.3);


(lib.End = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.end();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1280,720);


(lib.Car_anticipation = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.wheel();
	this.instance.setTransform(674,198,0.3443,0.3443);

	this.instance_1 = new lib.Car_electric();
	this.instance_1.setTransform(0,0,0.6373,0.6372);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,915.8,358.5);


(lib.Tween6 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.BG_full();
	this.instance.setTransform(-1939.75,-484.6,0.2429,0.2429);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1939.7,-484.6,3879.4,969.2);


(lib.Tween5 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.BG_full();
	this.instance.setTransform(-1939.7,-484.6,0.2429,0.2429);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1939.7,-484.6,3879.5,969.2);


(lib.Low_Opacity_BG = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(1,1,1).p("Ehj7g4YMDH3AAAMAAABwxMjH3AAAg");
	this.shape.setTransform(639.575,360.9);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("rgba(0,0,0,0.498)").s().p("Ehj7A4ZMAAAhwxMDH3AAAMAAABwxg");
	this.shape_1.setTransform(639.575,360.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,-1,1281.2,723.8);


(lib.Wheel = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween19("synched",0);
	this.instance.setTransform(80.05,80.2);

	this.instance_1 = new lib.Tween20("synched",0);
	this.instance_1.setTransform(80.05,80.25,1,1,90);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},9).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true,rotation:90,y:80.25},9).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-33.3,-33,226.7,226.6);


(lib.Tween17 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.CachedBmp_14();
	this.instance.setTransform(25.05,-53.25,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_13();
	this.instance_1.setTransform(-103.9,-48.35,0.5,0.5);

	this.instance_2 = new lib.GreenEnergy_icon("synched",0);
	this.instance_2.setTransform(195.85,1.45,1,1,0,0,0,39.8,40);

	this.instance_3 = new lib.Gas_icon("synched",0);
	this.instance_3.setTransform(-176.85,1.45,1,1,0,0,0,38.1,40);

	this.instance_4 = new lib.Score_board("synched",0);
	this.instance_4.setTransform(0.05,3.85,1,1,0,0,0,251,49.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-250.9,-53.2,501.9,106.5);


(lib.Tween14 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween28("synched",0);
	this.instance.setTransform(-3.45,3.4);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-247.5,-137.15,0.3859,0.3859);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-247.5,-137.1,495.1,274.29999999999995);


(lib.Tween13 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween28("synched",0);
	this.instance.setTransform(-3.3,3.7);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-247.5,-137.2,0.3859,0.3859);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-247.5,-137.2,495.1,274.4);


(lib.Tween25 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Info_text1("synched",0);
	this.instance.setTransform(0.05,-16.3,1,1,0,0,0,249.1,132.2);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-250,-136,0.3888,0.3827);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-250,-136,499,272.1);


(lib.Tween24 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Info_text1("synched",0);
	this.instance.setTransform(0.05,-18.3,1,1,0,0,0,249.1,132.2);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-250,-136,0.3888,0.3827);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-250,-136,499,272.1);


(lib.Fuel_car_gas3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_3
	this.instance = new lib.Gas_1("synched",0);
	this.instance.setTransform(31.4,83.7,1,1,0,0,0,31.1,30.5);
	this.instance.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:31,regY:30.6,scaleX:1.2003,scaleY:1.2003,rotation:29.9981,x:-25,y:51.7,alpha:1},23).to({alpha:0},6).wait(1));

	// Layer_1
	this.instance_1 = new lib.Gas_2("synched",0);
	this.instance_1.setTransform(27.3,103.9,1,1,0,0,0,36.8,36.8);
	this.instance_1.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({regX:36.7,scaleX:1.2727,scaleY:1.2727,rotation:14.9988,x:-83.35,y:77.8,alpha:1},23).to({alpha:0},6).wait(1));

	// Layer_2
	this.instance_2 = new lib.Gas_3("synched",0);
	this.instance_2.setTransform(26.4,123.55,1,1,0,0,0,26.4,26.9);
	this.instance_2.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({regX:26.2,scaleX:1.3055,scaleY:1.3055,rotation:-29.9993,x:-40.1,y:119.55,alpha:1},23).to({alpha:0},6).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-128.8,25.6,192.9,124.9);


(lib.Electric_gas = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween_gas_electric("synched",0);
	this.instance.setTransform(285,142.2,0.5924,0.5924,0,0,0,120.5,115.2);
	this.instance.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:0.8461,scaleY:0.8461,x:134.85,y:117.55,alpha:0.9102},21).to({alpha:0},8).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(236.7,20.1,245.7,180.1);


(lib.Fuel_car_1 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Wheel();
	this.instance.setTransform(118.15,162.5,0.5805,0.5805,0,0,0,80.3,80.4);

	this.instance_1 = new lib.Wheel();
	this.instance_1.setTransform(441,115.35,0.5804,0.5804);

	this.instance_2 = new lib.Fuel_car();
	this.instance_2.setTransform(0,0,0.3886,0.3886);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,586.8,209);


(lib.Tween8 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween26("synched",0);
	this.instance.setTransform(2.65,-18.05);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-249.4,-136.05,0.3888,0.3827);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-249.4,-136,498.9,272.1);


(lib.Tween4 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween26("synched",0);
	this.instance.setTransform(-0.3,-8.4);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-249.4,-136.05,0.3888,0.3827);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-249.4,-136,498.9,272.1);


(lib.Tween3 = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween26("synched",0);
	this.instance.setTransform(0.7,-18.05);

	this.instance_1 = new lib.board_1();
	this.instance_1.setTransform(-249.4,-136.05,0.3888,0.3827);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-249.4,-136,498.9,272.1);


(lib.Electric_car = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Wheel();
	this.instance.setTransform(109.05,279.05,1,1,0,0,0,80,80.2);

	this.instance_1 = new lib.Wheel();
	this.instance_1.setTransform(749,275.2,1,1,0,0,0,80,80.2);

	this.instance_2 = new lib.Car_electric();
	this.instance_2.setTransform(-5,-3,0.6373,0.6373);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-5,-3,915.8,362.3);


(lib.BG = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Layer_1
	this.instance = new lib.Tween5("synched",0);
	this.instance.setTransform(1939.7,484.6);

	this.instance_1 = new lib.Tween6("synched",0);
	this.instance_1.setTransform(-659.25,484.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},59).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true,x:-659.25},59).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-2599,0,6478.5,969.2);


// stage content:
(lib.Project = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.actionFrames = [0,39,50,219,434,569,639,739,759,783,796,842,863,910,961];
	this.streamSoundSymbolsList[0] = [{id:"CarDrivingSoundEffect",startFrame:0,endFrame:50,loop:1,offset:13726}];
	this.streamSoundSymbolsList[39] = [{id:"DingSoundEffectDownloadNoCopyright",startFrame:39,endFrame:219,loop:1,offset:1627}];
	this.streamSoundSymbolsList[50] = [{id:"CarDrivingSoundEffect",startFrame:50,endFrame:569,loop:1,offset:15813}];
	this.streamSoundSymbolsList[219] = [{id:"DingSoundEffectDownloadNoCopyright",startFrame:219,endFrame:405,loop:1,offset:0}];
	this.streamSoundSymbolsList[434] = [{id:"DingSoundEffectDownloadNoCopyright",startFrame:434,endFrame:874,loop:1,offset:0}];
	this.streamSoundSymbolsList[569] = [{id:"CarDrivingSoundEffect",startFrame:569,endFrame:570,loop:1,offset:0}];
	this.streamSoundSymbolsList[639] = [{id:"DingSoundEffectDownloadNoCopyright",startFrame:639,endFrame:874,loop:1,offset:0}];
	this.streamSoundSymbolsList[739] = [{id:"StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",startFrame:739,endFrame:874,loop:1,offset:0}];
	this.streamSoundSymbolsList[759] = [{id:"StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",startFrame:759,endFrame:874,loop:1,offset:0}];
	this.streamSoundSymbolsList[783] = [{id:"StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",startFrame:783,endFrame:874,loop:1,offset:0}];
	this.streamSoundSymbolsList[796] = [{id:"CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink",startFrame:796,endFrame:910,loop:1,offset:19067}];
	this.streamSoundSymbolsList[842] = [{id:"CarHornBeepSoundEffectHQ",startFrame:842,endFrame:910,loop:1,offset:1502}];
	this.streamSoundSymbolsList[863] = [{id:"StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",startFrame:863,endFrame:888,loop:1,offset:0}];
	this.streamSoundSymbolsList[910] = [{id:"CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink",startFrame:910,endFrame:960,loop:1,offset:19067}];
	// timeline functions:
	this.frame_0 = function() {
		this.clearAllSoundStreams();
		 
		var soundInstance = playSound("CarDrivingSoundEffect",0,13726);
		this.InsertIntoSoundStreamData(soundInstance,0,50,1,13726);
		var stage = this;
		stage.stop();
		
		var _this = this;
		/*
		Clicking on the specified symbol instance executes a function.
		*/
		_this.StartBtn.on('click', function(){
		/*
		Play a Movie Clip/Video or the current timeline.
		Plays the specified movie clip or video.
		*/
		_this.play();
		});
	}
	this.frame_39 = function() {
		var soundInstance = playSound("DingSoundEffectDownloadNoCopyright",0,1627);
		this.InsertIntoSoundStreamData(soundInstance,39,219,1,1627);
	}
	this.frame_50 = function() {
		var soundInstance = playSound("CarDrivingSoundEffect",0,15813);
		this.InsertIntoSoundStreamData(soundInstance,50,569,1,15813);
	}
	this.frame_219 = function() {
		var soundInstance = playSound("DingSoundEffectDownloadNoCopyright",0);
		this.InsertIntoSoundStreamData(soundInstance,219,405,1);
	}
	this.frame_434 = function() {
		var soundInstance = playSound("DingSoundEffectDownloadNoCopyright",0);
		this.InsertIntoSoundStreamData(soundInstance,434,874,1);
	}
	this.frame_569 = function() {
		var soundInstance = playSound("CarDrivingSoundEffect",0);
		this.InsertIntoSoundStreamData(soundInstance,569,570,1);
	}
	this.frame_639 = function() {
		var soundInstance = playSound("DingSoundEffectDownloadNoCopyright",0);
		this.InsertIntoSoundStreamData(soundInstance,639,874,1);
	}
	this.frame_739 = function() {
		var soundInstance = playSound("StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",0);
		this.InsertIntoSoundStreamData(soundInstance,739,874,1);
	}
	this.frame_759 = function() {
		var soundInstance = playSound("StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",0);
		this.InsertIntoSoundStreamData(soundInstance,759,874,1);
	}
	this.frame_783 = function() {
		var soundInstance = playSound("StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",0);
		this.InsertIntoSoundStreamData(soundInstance,783,874,1);
	}
	this.frame_796 = function() {
		var soundInstance = playSound("CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink",0,19067);
		this.InsertIntoSoundStreamData(soundInstance,796,910,1,19067);
	}
	this.frame_842 = function() {
		var soundInstance = playSound("CarHornBeepSoundEffectHQ",0,1502);
		this.InsertIntoSoundStreamData(soundInstance,842,910,1,1502);
	}
	this.frame_863 = function() {
		var soundInstance = playSound("StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds",0);
		this.InsertIntoSoundStreamData(soundInstance,863,888,1);
	}
	this.frame_910 = function() {
		var soundInstance = playSound("CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink",0,19067);
		this.InsertIntoSoundStreamData(soundInstance,910,960,1,19067);
	}
	this.frame_961 = function() {
		var _this = this;
		/*
		Stop a Movie Clip/Video
		Stops the specified movie clip or video.
		*/
		_this.stop();
		
		
		var _this = this;
		/*
		Clicking on the specified symbol instance executes a function.
		*/
		_this.Replay.on('click', function(){
		/*
		Play a Movie Clip/Video or the current timeline.
		Plays the specified movie clip or video.
		*/
		_this.play();
		});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(39).call(this.frame_39).wait(11).call(this.frame_50).wait(169).call(this.frame_219).wait(215).call(this.frame_434).wait(135).call(this.frame_569).wait(70).call(this.frame_639).wait(100).call(this.frame_739).wait(20).call(this.frame_759).wait(24).call(this.frame_783).wait(13).call(this.frame_796).wait(46).call(this.frame_842).wait(21).call(this.frame_863).wait(47).call(this.frame_910).wait(51).call(this.frame_961).wait(1));

	// Replay_Btn
	this.Replay = new lib.ReplayBtn();
	this.Replay.name = "Replay";
	this.Replay.setTransform(639.95,301.55,1,1,0,0,0,128.8,149.8);
	this.Replay._off = true;
	new cjs.ButtonHelper(this.Replay, 0, 1, 2, false, new lib.ReplayBtn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.Replay).wait(961).to({_off:false},0).wait(1));

	// Start_Btn
	this.StartBtn = new lib.StartBtn();
	this.StartBtn.name = "StartBtn";
	this.StartBtn.setTransform(640.05,360.05,1,1,0,0,0,118.4,118.4);
	new cjs.ButtonHelper(this.StartBtn, 0, 1, 2, false, new lib.StartBtn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.StartBtn).to({_off:true},1).wait(961));

	// Wining_img
	this.instance = new lib.Tween32("synched",0);
	this.instance.setTransform(1013,409.95);
	this.instance._off = true;

	this.instance_1 = new lib.Tween33("synched",0);
	this.instance_1.setTransform(1051.2,330.6,0.4545,0.4545);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(868).to({_off:false},0).to({_off:true,scaleX:0.4545,scaleY:0.4545,x:1051.2,y:330.6},10).wait(84));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(868).to({_off:false},10).wait(18).to({startPosition:0},0).to({scaleX:0.2038,scaleY:0.2038,x:509.85,y:569.4},17).wait(35).to({startPosition:0},0).to({alpha:0},11).to({_off:true},1).wait(2));

	// Electric_car_win
	this.instance_2 = new lib.Electric_car("synched",0);
	this.instance_2.setTransform(-506.85,509.1,1,1,0,0,0,431.8,167.1);
	this.instance_2._off = true;

	this.instance_3 = new lib.wheel();
	this.instance_3.setTransform(131,540,0.3443,0.3443);

	this.instance_4 = new lib.Car_electric();
	this.instance_4.setTransform(-544,342,0.6373,0.6372);

	this.instance_5 = new lib.wheel();
	this.instance_5.setTransform(680,542,0.3443,0.3481);

	this.instance_6 = new lib.Winner_car("synched",0);
	this.instance_6.setTransform(462.9,523.6,1,1,0,0,0,457.9,181.6);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_2}]},796).to({state:[{t:this.instance_2}]},11).to({state:[{t:this.instance_4,p:{scaleY:0.6372,x:-544}},{t:this.instance_3,p:{scaleY:0.3443,x:131,y:540}}]},1).to({state:[{t:this.instance_2}]},10).to({state:[{t:this.instance_2}]},6).to({state:[{t:this.instance_2}]},17).to({state:[{t:this.instance_4,p:{scaleY:0.6443,x:5}},{t:this.instance_5},{t:this.instance_3,p:{scaleY:0.3481,x:39,y:543}}]},1).to({state:[{t:this.instance_6}]},106).to({state:[{t:this.instance_6}]},11).to({state:[]},1).wait(2));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(796).to({_off:false},0).to({x:-111.95},11).to({_off:true},1).wait(10).to({_off:false},0).to({x:-185.45},6).to({x:436.8},17,cjs.Ease.none).to({_off:true},1).wait(120));
	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(948).to({_off:false},0).to({alpha:0},11).to({_off:true},1).wait(2));

	// Electric_car
	this.instance_7 = new lib.wheel();
	this.instance_7.setTransform(246,540,0.3443,0.3443);

	this.instance_8 = new lib.Car_electric();
	this.instance_8.setTransform(-428,342,0.6373,0.6372);

	this.instance_9 = new lib.Car_anticipation("synched",0);
	this.instance_9.setTransform(29.9,521.2,1,1,0,0,0,457.9,179.2);
	this.instance_9._off = true;

	this.instance_10 = new lib.Electric_car("synched",0);
	this.instance_10.setTransform(3.8,509.1,1,1,0,0,0,431.8,167.1);
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_8},{t:this.instance_7}]}).to({state:[{t:this.instance_9}]},1).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},6).to({state:[{t:this.instance_9}]},5).to({state:[{t:this.instance_10}]},1).to({state:[{t:this.instance_10}]},60).to({state:[{t:this.instance_10}]},39).to({state:[{t:this.instance_10}]},138).to({state:[{t:this.instance_10}]},7).to({state:[{t:this.instance_10}]},9).to({state:[{t:this.instance_10}]},194).to({state:[{t:this.instance_10}]},13).to({state:[{t:this.instance_10}]},17).to({state:[{t:this.instance_10}]},14).to({state:[{t:this.instance_10}]},11).to({state:[{t:this.instance_10}]},17).to({state:[]},1).wait(393));
	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(1).to({_off:false},0).to({y:515.05},6).to({y:516.6},6).to({y:513.55},6).to({y:516.6},6).to({y:513.55},6).to({y:516.6},6).to({y:513.5},6).to({x:25.9,y:518.6},5).to({_off:true},1).wait(913));
	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(49).to({_off:false},0).to({x:749.45},60,cjs.Ease.sineInOut).to({x:602.65},39,cjs.Ease.backIn).wait(138).to({startPosition:0},0).to({x:663.9},7).to({x:795.1},9).wait(194).to({x:815.1},0).to({x:554.5},13).wait(17).to({startPosition:0},0).to({x:743},14).wait(11).to({startPosition:0},0).to({x:1727.55},17).to({_off:true},1).wait(393));

	// ScoreBoard
	this.instance_11 = new lib.CachedBmp_2();
	this.instance_11.setTransform(672,-2.8,0.5,0.5);

	this.instance_12 = new lib.CachedBmp_1();
	this.instance_12.setTransform(543.05,-2.8,0.5,0.5);

	this.instance_13 = new lib.GreenEnergy_icon("synched",0);
	this.instance_13.setTransform(842.8,47,1,1,0,0,0,39.8,40);

	this.instance_14 = new lib.Gas_icon("synched",0);
	this.instance_14.setTransform(470.1,47,1,1,0,0,0,38.1,40);

	this.instance_15 = new lib.Score_board("synched",0);
	this.instance_15.setTransform(647,49.4,1,1,0,0,0,251,49.4);

	this.instance_16 = new lib.CachedBmp_4();
	this.instance_16.setTransform(672,-2.8,0.5,0.5);

	this.instance_17 = new lib.CachedBmp_3();
	this.instance_17.setTransform(543.05,-2.8,0.5,0.5);

	this.instance_18 = new lib.CachedBmp_6();
	this.instance_18.setTransform(672,-2.8,0.5,0.5);

	this.instance_19 = new lib.CachedBmp_5();
	this.instance_19.setTransform(543.05,-2.8,0.5,0.5);

	this.instance_20 = new lib.CachedBmp_8();
	this.instance_20.setTransform(672,-7.7,0.5,0.5);

	this.instance_21 = new lib.CachedBmp_7();
	this.instance_21.setTransform(543.05,-2.8,0.5,0.5);

	this.instance_22 = new lib.Tween17("synched",0);
	this.instance_22.setTransform(646.95,45.55);
	this.instance_22._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_15},{t:this.instance_14},{t:this.instance_13},{t:this.instance_12},{t:this.instance_11}]}).to({state:[{t:this.instance_15},{t:this.instance_14},{t:this.instance_13},{t:this.instance_17},{t:this.instance_16}]},228).to({state:[{t:this.instance_15},{t:this.instance_14},{t:this.instance_13},{t:this.instance_19},{t:this.instance_18}]},207).to({state:[{t:this.instance_15},{t:this.instance_14},{t:this.instance_13},{t:this.instance_21},{t:this.instance_20}]},206).to({state:[{t:this.instance_22}]},307).to({state:[{t:this.instance_22}]},11).to({state:[]},1).wait(2));
	this.timeline.addTween(cjs.Tween.get(this.instance_22).wait(948).to({_off:false},0).to({alpha:0},11).to({_off:true},1).wait(2));

	// Summary_cheaper
	this.instance_23 = new lib.Cheaper("synched",0);
	this.instance_23.setTransform(910.55,506.7,1.178,1.1782,0,0,0,164.5,210.8);
	this.instance_23._off = true;
	var instance_23Filter_1 = new cjs.ColorFilter(1,1,1,1,0,0,0,0);
	this.instance_23.filters = [instance_23Filter_1];
	this.instance_23.cache(-2,-2,333,425);

	this.timeline.addTween(cjs.Tween.get(this.instance_23).wait(771).to({_off:false},0).to({regX:164.4,scaleX:0.5218,scaleY:0.5219,x:910.45},16).wait(16).to({startPosition:0},0).to({x:1073.65,y:507.35},5).wait(19).to({startPosition:0},0).to({x:1985.65},25).to({_off:true},1).wait(109));
	this.timeline.addTween(cjs.Tween.get(instance_23Filter_1).wait(771).to(new cjs.ColorFilter(0,0,0,1,255,255,255,0), 0).wait(190));

	// Summary_greener
	this.instance_24 = new lib.Greener_icon("synched",0);
	this.instance_24.setTransform(643.1,507.35,0.1859,0.1859,0,0,0,724.7,876.9);
	this.instance_24._off = true;
	var instance_24Filter_2 = new cjs.ColorFilter(1,1,1,1,0,0,0,0);
	this.instance_24.filters = [instance_24Filter_2];
	this.instance_24.cache(-2,-2,1453,1757);

	this.timeline.addTween(cjs.Tween.get(this.instance_24).wait(750).to({_off:false},0).to({regX:725.1,regY:877,scaleX:0.1254,scaleY:0.1254},16).wait(37).to({startPosition:0},0).to({x:817.05},5).wait(19).to({startPosition:0},0).to({x:1727.95},25).to({_off:true},1).wait(109));
	this.timeline.addTween(cjs.Tween.get(instance_24Filter_2).wait(750).to(new cjs.ColorFilter(0,0,0,1,255,255,255,0), 0).wait(211));

	// Summary_faster
	this.instance_25 = new lib.Faster_icon("synched",0);
	this.instance_25.setTransform(354.6,497.3,1.0078,1.0078,0,0,0,142.6,180.3);
	this.instance_25._off = true;
	var instance_25Filter_3 = new cjs.ColorFilter(1,1,1,1,0,0,0,0);
	this.instance_25.filters = [instance_25Filter_3];
	this.instance_25.cache(-2,-2,289,365);

	this.timeline.addTween(cjs.Tween.get(this.instance_25).wait(732).to({_off:false},0).to({regX:142.7,regY:180.4,scaleX:0.6107,scaleY:0.6107,x:354.65},16).wait(55).to({startPosition:0},0).to({x:528.6},5).wait(19).to({startPosition:0},0).to({x:1439.5},25).to({_off:true},1).wait(109));
	this.timeline.addTween(cjs.Tween.get(instance_25Filter_3).wait(732).to(new cjs.ColorFilter(0,0,0,1,255,255,255,0), 0).wait(229));

	// Board_info
	this.instance_26 = new lib.Tween24("synched",0);
	this.instance_26.setTransform(645.05,-143);
	this.instance_26._off = true;

	this.instance_27 = new lib.Tween25("synched",0);
	this.instance_27.setTransform(648.8,215.35);
	this.instance_27._off = true;

	this.instance_28 = new lib.Tween3("synched",0);
	this.instance_28.setTransform(648.4,-124.95);
	this.instance_28._off = true;

	this.instance_29 = new lib.Tween4("synched",0);
	this.instance_29.setTransform(649.4,204.05);
	this.instance_29._off = true;

	this.instance_30 = new lib.Tween8("synched",0);
	this.instance_30.setTransform(648.4,-124.95);

	this.instance_31 = new lib.Tween13("synched",0);
	this.instance_31.setTransform(650.5,-136.8);
	this.instance_31._off = true;

	this.instance_32 = new lib.Tween14("synched",0);
	this.instance_32.setTransform(650.5,217.15);
	this.instance_32._off = true;

	this.instance_33 = new lib.Tween15("synched",0);
	this.instance_33.setTransform(634.85,1055.4);
	this.instance_33._off = true;

	this.instance_34 = new lib.Tween16("synched",0);
	this.instance_34.setTransform(634.85,429.85);
	this.instance_34._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_26}]},182).to({state:[{t:this.instance_26}]},13).to({state:[{t:this.instance_27}]},77).to({state:[{t:this.instance_27}]},13).to({state:[{t:this.instance_28}]},104).to({state:[{t:this.instance_29}]},15).to({state:[{t:this.instance_29}]},74).to({state:[{t:this.instance_30}]},13).to({state:[]},1).to({state:[{t:this.instance_31}]},103).to({state:[{t:this.instance_32}]},10).to({state:[{t:this.instance_32}]},81).to({state:[{t:this.instance_32}]},11).to({state:[{t:this.instance_33}]},7).to({state:[{t:this.instance_34}]},18).to({state:[{t:this.instance_34}]},81).to({state:[{t:this.instance_34}]},5).to({state:[{t:this.instance_34}]},19).to({state:[{t:this.instance_34}]},25).to({state:[]},1).wait(109));
	this.timeline.addTween(cjs.Tween.get(this.instance_26).wait(182).to({_off:false},0).to({x:648.4,y:204.7},13).to({_off:true},77).wait(690));
	this.timeline.addTween(cjs.Tween.get(this.instance_27).wait(272).to({_off:false},0).to({x:644.4,y:-99.95},13).to({_off:true},104).wait(573));
	this.timeline.addTween(cjs.Tween.get(this.instance_28).wait(389).to({_off:false},0).to({_off:true,x:649.4,y:204.05},15).wait(558));
	this.timeline.addTween(cjs.Tween.get(this.instance_29).wait(389).to({_off:false},15).wait(74).to({startPosition:0},0).to({_off:true,x:648.4,y:-124.95},13).wait(471));
	this.timeline.addTween(cjs.Tween.get(this.instance_31).wait(595).to({_off:false},0).to({_off:true,y:217.15},10).wait(357));
	this.timeline.addTween(cjs.Tween.get(this.instance_32).wait(595).to({_off:false},10).wait(81).to({y:207.15},0).to({x:650.35,y:-130.2},11).to({_off:true},7).wait(258));
	this.timeline.addTween(cjs.Tween.get(this.instance_33).wait(704).to({_off:false},0).to({_off:true,y:429.85},18).wait(240));
	this.timeline.addTween(cjs.Tween.get(this.instance_34).wait(704).to({_off:false},18).wait(81).to({startPosition:0},0).to({x:808.85,y:432.3},5).wait(19).to({startPosition:0},0).to({x:1713.3},25).to({_off:true},1).wait(109));

	// Low_opacity
	this.instance_35 = new lib.Low_Opacity_BG("synched",0);
	this.instance_35.setTransform(639.6,360.95,1,1,0,0,0,639.6,360.9);
	this.instance_35.alpha = 0;
	this.instance_35._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_35).wait(162).to({_off:false},0).to({alpha:1},19).wait(91).to({startPosition:0},0).to({alpha:0},13).wait(104).to({startPosition:0},0).to({alpha:1},27).wait(58).to({startPosition:0},0).to({alpha:0},19).wait(99).to({startPosition:0},0).to({alpha:1},27).to({_off:true},341).wait(2));

	// Kilometers
	this.instance_36 = new lib.Kilometers("synched",0);
	this.instance_36.setTransform(1178.15,74.2,1,1,0,0,0,131.3,74.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_36).wait(592).to({startPosition:592},0).to({alpha:0,startPosition:609},17).to({_off:true},1).wait(352));

	// Fuel_car
	this.instance_37 = new lib.Fuel_car_anticipation("synched",0);
	this.instance_37.setTransform(20.8,260.5,1,1,0,0,0,276.8,98.5);

	this.instance_38 = new lib.Fuel_car_1("synched",0);
	this.instance_38.setTransform(20.45,260.45,0.9433,0.9433,0,0,0,293.4,104.2);
	this.instance_38._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_37).wait(1).to({startPosition:0},0).to({y:263.6},6).to({y:260.5},6).to({y:263.6},6).to({y:260.5},6).to({y:263.6},6).to({y:260.5},6).to({y:263.6},6).to({y:260.5},5).to({_off:true},1).wait(913));
	this.timeline.addTween(cjs.Tween.get(this.instance_38).wait(49).to({_off:false},0).to({x:866.5},84,cjs.Ease.quadInOut).to({x:428.6},31,cjs.Ease.sineInOut).wait(122).to({x:438.4},0).to({x:858.3},20).wait(206).to({startPosition:0},0).to({x:448.1},15).wait(10).to({startPosition:0},0).to({x:708.75},10).wait(4).to({startPosition:0},0).to({x:1572.5},25).to({_off:true},1).wait(385));

	// Gas_Electric_car
	this.instance_39 = new lib.Electric_gas("synched",0);
	this.instance_39.setTransform(100.15,519.4,1,1,0,0,0,120.5,115.2);
	this.instance_39._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_39).wait(293).to({_off:false},0).to({x:86.55,startPosition:20},20).to({x:73.3,startPosition:11},15).to({_off:true},49).wait(585));

	// Fuel_car_gas
	this.instance_40 = new lib.Fuel_car_gas3("synched",0);
	this.instance_40.setTransform(409.4,218.5,1,1,0,0,0,50.2,59.5);
	this.instance_40._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_40).wait(295).to({_off:false},0).to({x:622.4,startPosition:11},11).to({_off:true},78).wait(578));

	// Ending
	this.instance_41 = new lib.End("synched",0);
	this.instance_41.setTransform(640,359,1,1,0,0,0,640,360);
	this.instance_41._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_41).wait(960).to({_off:false},0).wait(2));

	// BG
	this.instance_42 = new lib.BG_full();
	this.instance_42.setTransform(0,-246,0.2429,0.2429);

	this.instance_43 = new lib.BG();
	this.instance_43.setTransform(1939.65,238.6,1,1,0,0,0,1939.7,484.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#000000").ss(1,1,1).p("Egm3AAAMBNvAAA");
	this.shape.setTransform(644.75,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_42}]}).to({state:[{t:this.shape},{t:this.instance_43}]},49).to({state:[{t:this.instance_42}]},502).to({state:[]},409).wait(2));

	this.filterCacheList = [];
	this.filterCacheList.push({instance: this.instance_23, startFrame:771, endFrame:771, x:-2, y:-2, w:333, h:425});
	this.filterCacheList.push({instance: this.instance_23, startFrame:0, endFrame:0, x:-2, y:-2, w:333, h:425});
	this.filterCacheList.push({instance: this.instance_24, startFrame:750, endFrame:750, x:-2, y:-2, w:1453, h:1757});
	this.filterCacheList.push({instance: this.instance_24, startFrame:0, endFrame:0, x:-2, y:-2, w:1453, h:1757});
	this.filterCacheList.push({instance: this.instance_25, startFrame:732, endFrame:732, x:-2, y:-2, w:289, h:365});
	this.filterCacheList.push({instance: this.instance_25, startFrame:0, endFrame:0, x:-2, y:-2, w:289, h:365});
	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(-303.6,81,4183.1,1307.9);
// library properties:
lib.properties = {
	id: 'B43760F0147DC44798FF608C00611D53',
	width: 1280,
	height: 720,
	fps: 24,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/BG_full.png?1688140200520", id:"BG_full"},
		{src:"images/Project_atlas_1.png?1688140200314", id:"Project_atlas_1"},
		{src:"images/Project_atlas_2.png?1688140200314", id:"Project_atlas_2"},
		{src:"images/Project_atlas_3.png?1688140200314", id:"Project_atlas_3"},
		{src:"images/Project_atlas_4.png?1688140200315", id:"Project_atlas_4"},
		{src:"images/Project_atlas_5.png?1688140200315", id:"Project_atlas_5"},
		{src:"images/Project_atlas_6.png?1688140200315", id:"Project_atlas_6"},
		{src:"images/Project_atlas_7.png?1688140200316", id:"Project_atlas_7"},
		{src:"sounds/CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink.mp3?1688140200520", id:"CararrivalstopanddeparturesoundeffectssfxNocopyrightdownloadLink"},
		{src:"sounds/CarDrivingSoundEffect.mp3?1688140200520", id:"CarDrivingSoundEffect"},
		{src:"sounds/CarHornBeepSoundEffectHQ.mp3?1688140200520", id:"CarHornBeepSoundEffectHQ"},
		{src:"sounds/DingSoundEffectDownloadNoCopyright.mp3?1688140200520", id:"DingSoundEffectDownloadNoCopyright"},
		{src:"sounds/StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds.mp3?1688140200520", id:"StampSoundEffectPopularSoundscopyrightfreeCopyrightFreeHomeOfficeSounds"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['B43760F0147DC44798FF608C00611D53'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;