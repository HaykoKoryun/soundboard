var _express = require('express');
var _app = _express();

var _nwglobal = require('nwglobal');
var _gui = require('nw.gui');
var _win = _gui.Window.get();

var _dive = require("dive");
var _path = require("path");

_app.use('/', _express.static('remote/'));
_app.use('/common/', _express.static('common/'));

var _server = _app.listen(8888);

_io = require('socket.io').listen(_server);

var _admin;

var audio = {};

_io.sockets.on('connection', function(socket)
{
	socket.on('auth', function(data)
	{
		socket.emit("auth", {});
		
		if(data.key == 'Freddy Krueger')
		{
			socket.on("volume", function(data)
			{
				audio[data.id].setVolume(data.volume);
			});
			
			socket.on("play", function(data)
			{
				audio[data.id].play();
			});
			
			socket.on("pause", function(data)
			{
				audio[data.id].pause();
			});
			
			socket.on("seek", function(data)
			{
				audio[data.id].setPercent(data.percent);
			});
			
			socket.on("stop", function(data)
			{
				audio[data.id].stop();
				socket.emit("stop", {id:data.id})
			});
			
			socket.on("get-list", function()
			{
				socket.emit("list", {loops:loops, effects:effects});
			})
			
			_admin = socket;
		}
	});
});

var loops = _nwglobal.Array();
var effects = _nwglobal.Array();

var _status = $("#status");
var _step = $("#step");

function init()
{
	discoverLibrary();
}

function discoverLibrary()
{
	discoverLoops();
	
	function discoverLoops()
	{
		_status.text("auto discovering loops");
		_step.text('');
		
		var libpath = _path.join(process.cwd(), "/audio/loops/");
		
		console.log(libpath);
	
		_dive
		(
			libpath,
			{},
			function(err, file)
			{
				setup(file, libpath, loops, true);
			},
			discoverEffects
		);
	}
	
	function discoverEffects()
	{
		_status.text("auto discovering effects");
		_step.text('');
		
		var libpath = _path.join(process.cwd(), "/audio/effects/");
	
		_dive
		(
			libpath,
			{},
			function(err, file)
			{
				setup(file, libpath, effects, false);
			},
			libready
		);
	}
	
	function setup(file, libpath, lib, loop)
	{		
		var reg = new RegExp("\\" + _path.sep, "g");
		var filepath = file.substring(libpath.length);
		
		var id = filepath.substring(0, filepath.length - _path.extname(filepath).length).replace(reg, "/");
		lib.push(id);
		
		_step.text('processed: ' + id);

		audio[id] = new buzz.sound( libpath + filepath.substring(0, filepath.length - _path.extname(filepath).length), { formats: [ "ogg" ] } );
		audio[id].id = id;
		audio[id].loop();
		audio[id].setVolume(50);
		
		audio[id].bind("timeupdate", function(e)
		{
			if(_admin != null)
			{
				_admin.emit("playing", {percent:this.getPercent(), id:this.id});
			}
		});
		
		audio[id].bind("ended", function(e)
		{
			if(_admin != null)
			{
				_admin.emit("stop", {id:this.id});
			}
		});
	}
}

function libready()
{
	_status.text("audio library ready!");
	_step.text('');
}

$(document).ready(init);