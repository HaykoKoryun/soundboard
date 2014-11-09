var socket = io.connect();
socket.on("connection", function(){console.log("boo")});

socket.on('auth-challenge', function()
{
	
});

function showPasswordField()
{
	var form = $("<div id='password-form'></div>");
}

$(document).ready(function()
{
	setTimeout(function(){socket.emit('auth', {'key':'Freddy Krueger'});}, 1000);
	
	socket.on("auth", ready);
});

var folders = {};
var ids2f = {};

function ready()
{
	socket.on("list", function(data)
	{
		var list = data.loops;
		for(var i = 0; i < list.length; ++i)
		{
			var id = list[i].id;
			var label = list[i].name;
			
			var folder = "#loops-misc";
			
			if(label.indexOf("/") != -1)
			{
				folder = label.substring(0, label.indexOf("/"));
				if(!folders.hasOwnProperty(folder))
				{
					folders[folder] = {};
					
					$("#loops").append
					(
						"<div class='folder' id='" + folder + "'>\
							<div class='title' id='" + folder + "-title'>" + folder.replace(/\-/ig, ' ') + "</div>\
							<div class='collapse-expand collapse'></div>\
							<div class='indicator'></div>\
						</div>"
					);
				}
				
				folder = "#" + folder;
				label = label.substring(label.indexOf("/") + 1);
			}
			
			$(folder).append
			(
				'<div class="loop" id="' + id + '">\
					<div class="duration">\
						<input value="0"/>\
					</div>\
					<div class="volume">\
						<input value="50"/>\
					</div>\
					<div class="play-pause play"></div>\
					<div class="stop"></div>\
					<div class="id">'  + label + '</div>\
				</div>'
			);
			
			ids2f[id] = folder;
		}		
		
		$("#loops .folder").append('<div class="clear"></div>');
		
		folder = "#effects-misc";
					
		list = data.effects;
		for(var i = 0; i < list.length; ++i)
		{
			var id = list[i].id;
			var label = list[i].name;
			
			$(folder).append
			(
				'<div class="effect" id="' + id + '">\
					<div class="duration">\
						<input value="0"/>\
					</div>\
					<div class="volume">\
						<input value="50"/>\
					</div>\
					<div class="play-pause play"></div>\
					<div class="stop"></div>\
					<div class="id">'  + label + '</div>\
				</div>'
			);
			
			ids2f[id] = folder;
		}
		
		$("#effects-misc").append('<div class="clear"></div>');
		
		$(".collapse-expand").click(toggleCollapse);
		
		buildMenu();
		buildKnobs();
	});
	
	function toggleCollapse()
	{
		if($(this).hasClass('collapse'))
		{
			$(this).toggleClass('collapse');
			$(this).parent().toggleClass('collapsed');
		}
		else
		{
			$(this).toggleClass('collapse');
			$(this).parent().toggleClass('collapsed');
		}
	}
	
	socket.emit("get-list",{});
	
	function buildMenu()
	{
		var menu = $("#menu");
		menu.append("<div class='label'>loops</div>");
		menu.append("<a class='' id='menu_loops-misc' href='#loops-misc-title'>misc<div class='indicator'></div></a>");
		
		for(key in folders)
		{
			menu.append("<a class='' id='menu_" + key + "' href='#" + key + "-title'>" + key.replace(/\-/ig, ' ') + "<div class='indicator'></div></a>");
		}
		
		menu.append("<div class='label'>effects</div>");
		menu.append("<a class='' id='menu_effects-misc' href='#effects-misc-title'>misc<div class='indicator'></div></a>");
	}
	
	function buildKnobs()
	{
		$(".loop").each(function()
		{
			var id = $(this).attr("id");
			$(this).find('.duration input').knob
			(
				{
					"min":0,
					"max":100,
					"bgColor":"#171717",
					"fgColor":"#96ff00",
					"skin":"tron",
					"cursor":false,
					"displayInput":false,
					"width":150,
					"height":150,
					"thickness":0.2,
					"displayPrevious":true,
					
					"release":function(v)
					{
						socket.emit("seek", {"percent":v, "id":id});
						return false;
					}
				}
			);
			
			$(this).find('.volume input').knob
			(
				{
					"min":0,
					"max":100,
					"bgColor":"#171717",
					"fgColor":"#00f0ff",
					"skin":"tron",
					"cursor":false,
					"displayInput":false,
					"width":110,
					"height":110,
					"thickness":0.3,
					"angleOffset":-145,
					"angleArc":290,
					
					"change":function(v)
					{
						socket.emit("volume", {"volume":v, "id":id});
					}
				}
			);
		});
		
		$(".effect").each(function()
		{
			var id = $(this).attr("id");
			$(this).find('.duration input').knob
			(
				{
					"min":0,
					"max":100,
					"bgColor":"#171717",
					"fgColor":"#96ff00",
					"skin":"tron",
					"cursor":false,
					"displayInput":false,
					"width":65,
					"height":65,
					"thickness":0.1,
					"readOnly":true
				}
			);
			
			$(this).find('.volume input').knob
			(
				{
					"min":0,
					"max":100,
					"bgColor":"#171717",
					"fgColor":"#00f0ff",
					"skin":"tron",
					"cursor":false,
					"displayInput":false,
					"width":110,
					"height":110,
					"thickness":0.3,
					"angleOffset":-145,
					"angleArc":290,
					
					"change":function(v)
					{
						socket.emit("volume", {"volume":v, "id":id});
					}
				}
			);
		});
		
		$(".loop, .effect").each(function()
		{	
			var id = $(this).attr("id");
			
			$(this).find(".play-pause").click(function()
			{
				if($(this).hasClass("play"))
				{
					socket.emit("play", {"id":id});
					$(this).removeClass("play").addClass("pause");
				}
				else
				{
					socket.emit("pause", {"id":id});
					$(this).removeClass("pause").addClass("play");
				}
			});
			
			$(this).find(".stop").click(function()
			{
				socket.emit("stop", {"id":id});
			});
		});
		
		socket.on("playing", function(data)
		{
			$('#' + data.id + ' .duration input').val(data.percent, false).trigger('update');
			if($('#' + data.id + ' .play-pause').hasClass("play"))
			{
				//$('#' + data.id + ' .play-pause').removeClass("play").addClass("pause");
			}
			if(data.percent != 0)
			{
				var folder = $(ids2f[data.id]);
				if(!folder.hasClass("playing"))
				{
					folder.addClass("playing");
					console.log(data.id);
					$(ids2f[data.id].replace(/#/, "#menu_")).addClass("playing");
				}
			}
			else
			{
				var folder = $(ids2f[data.id]);
				folder.removeClass("playing");
				$(ids2f[data.id].replace(/#/, "#menu_")).removeClass("playing");
			}
		});
		
		socket.on("stop", function(data)
		{
			console.log('stop');
			$('#' + data.id + ' .duration input').val(0, false).trigger('update');
			$('#' + data.id + ' .play-pause').removeClass("pause").addClass("play");
			var folder = $(ids2f[data.id]);
			folder.removeClass("playing");
			$(ids2f[data.id].replace(/#/, "#menu_")).removeClass("playing");
		});
	}
}

