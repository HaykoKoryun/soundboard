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

function ready()
{
	socket.on("list", function(data)
	{
		var list = data.loops;
		for(var i = 0; i < list.length; ++i)
		{
			var id = list[i];
			var label = id;
			var folder = "#loops-misc";
			
			if(id.indexOf("/") != -1)
			{
				folder = id.substring(0, id.indexOf("/"));
				if(!folders.hasOwnProperty(folder))
				{
					folders[folder] = {};
					$("#loops").append
					(
						"<div class='folder' id='" + folder + "'>\
							<div class='title' id='" + folder + "-title'>" + folder + "</div>\
							<div class='collapse-expand collapse'></div>\
						</div>"
					);
				}
				
				folder = "#" + folder;
				label = id.substring(id.indexOf("/") + 1);
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
		}		
		
		$("#loops .folder").append('<div class="clear"></div>');
		
		folder = "#effects-misc";
					
		list = data.effects;
		for(var i = 0; i < list.length; ++i)
		{
			$(folder).append
			(
				'<div class="effect" id="' + list[i] + '">\
					<div class="duration">\
						<input value="0"/>\
					</div>\
					<div class="volume">\
						<input value="50"/>\
					</div>\
					<div class="play-pause play"></div>\
					<div class="stop"></div>\
					<div class="id">'  + list[i] + '</div>\
				</div>'
			);
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
		menu.append("<a href='#loops-misc-title'>misc</a>");
		
		for(key in folders)
		{
			menu.append("<a href='#" + key + "-title'>" + key + "</a>");
		}
		
		menu.append("<div class='label'>effects</div>");
		menu.append("<a href='#effects-misc-title'>misc</a>");
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
		});
		
		socket.on("stop", function(data)
		{
			console.log('stop');
			$('#' + data.id + ' .duration input').val(0, false).trigger('update');
			$('#' + data.id + ' .play-pause').removeClass("pause").addClass("play");
		});
	}
}

