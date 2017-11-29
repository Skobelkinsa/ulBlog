(function ($){

    $.fn.bubbles = function(Options) {

        var Settings = $.extend({
            minRadius: 35,
            maxRadius: 125,
			canvasWidth: 1200,
			canvasHeight: 600,
			mobileHeight: 800,
			textFontFamily: 'Lato-Light',
			textColor: 'rgba(255, 255, 255, 0.5)',
			hoverTextColor: 'rgba(255, 255, 255, 0.8)',
			hoverSubtitleColor: '#68bee0',
			borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.9)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
            data: [],
			showBullets: false,
			bulletsContainerID: '',
			rightBorder: false,
			leftBorder: false,
			topBorder: false,
			bottomBorder: false,
			rebuildOnResize: false
        }, Options );
		var OldCanvasWidth = Settings.canvasWidth;
		var OldCanvasHeight = Settings.canvasHeight;
		var WindowWidth = $(window).width();
		var WindowHeight = $(window).height();
        var Data = Settings.data;
		var ID = $(this).attr('id');
		var MaxValue = 0;
		var MinValue = 0;
		var ContainerWidth = $(this).width();
		var Radiuses = new Object();

		if (ContainerWidth < Settings.canvasWidth)
		{
			Settings.canvasWidth = ContainerWidth;
			OldCanvasWidth = ContainerWidth;
		}

		if (WindowWidth <= 450)
		{
			Settings.canvasHeight = Settings.mobileHeight;
			OldCanvasHeight = Settings.mobileHeight;
		}

		Settings.bulletsContainerID = (Settings.bulletsContainerID != '' ? Settings.bulletsContainerID : ID);
		Settings.x = d3.scale.ordinal().domain(d3.range(Settings.data.length)).rangePoints([0, Settings.canvasWidth], 1);

		/// D3 VARIABLES
		var format, bubble, svg, FormattedData, node, xScale, yScale;
        
		Data = SetDataIDs(Data);
		BuildCircularChart();
		if (Settings.showBullets)
			BuildBullets();

		$(window).resize(OnWindowResize);
		function OnWindowResize(){
			if (!Settings.rebuildOnResize)
				return -2;

			WindowWidth = $(window).width();
			WindowHeight = $(window).height();

			if (WindowWidth < Settings.canvasWidth)
				Settings.canvasWidth = WindowWidth;
			else
				Settings.canvasWidth = OldCanvasWidth;
			if (WindowHeight < Settings.canvasHeight)
				Settings.canvasHeight = WindowHeight;
			else
				Settings.canvasHeight = OldCanvasHeight;

			$('#' + ID).find('svg').remove();
			BuildCircularChart();
		}

		function BuildCircularChart(){
			var Arr = $.map(Data, function(o){ return o.value; });
			MaxValue = Math.max.apply(this, Arr);
			MinValue = Math.min.apply(this, Arr);

			var n = 6,
				m = 1,
				padding = 12;

			FormattedData = FormatData(Data);

			bubble = d3.layout.force()
				.nodes(FormattedData)
				.size([Settings.canvasWidth, Settings.canvasHeight])
				.gravity(0.03)
				.charge(-200)
				.linkDistance(0)
				.linkStrength(100)
				.on("tick", tick);

			bubble.slowMotion = true;
			bubble.fullSpeed = false;
			bubble.friction(0.9);
			bubble.start();

			svg = d3.select('#' + ID).append('svg')
				.attr("width", Settings.canvasWidth)
				.attr("height", Settings.canvasHeight)
				.attr("class", "bubble");

			node = svg.selectAll(".node")
				.data(FormattedData)
				.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + Math.ceil(d.x) + "," + Math.ceil(d.y) + ")"; })
				.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; })

			node.append("circle")
				.attr("r", function(d) { return d.radius; })
				.attr('id', function(d) { return d.id; })
				.style("cursor", "pointer")
				.style("fill", Settings.backgroundColor)
				.style("stroke", Settings.borderColor)
				.style("stroke-width", Settings.borderWidth);

			node.append("clipPath")
				.attr("id", function(d) { return "clip-" + d.id; })
				.append("use")
				.attr("xlink:href", function(d) { return "#" + d.id; });

			node.append("text")
				.attr("class", "title")
				.attr("circle-id", function(d) { return d.id; })
				.style("text-anchor", "middle")
				.style("fill", Settings.textColor)
				.style("font-size", Settings.textFontSize)
				.style("cursor", "pointer")
				.style("font-family", Settings.textFontFamily)
				.html(function(d) { return d.title; })
				.call(wrap);

			node.append("text")
				.attr("dy", function(d){
					var Circle = d3.select('#' + d.id);
					Circle.attr('maxdy', Settings.valueFontSize * 0.6);
					return Settings.valueFontSize * 0.3 + 'px';
				})
				.attr("class", "subtitle-value")
				.style("text-anchor", "middle")
				.style("cursor", "pointer")
				.style("font-size", Settings.valueFontSize)
				.style("fill", "rgba(255, 255, 255, 0)")
				.style("font-family", Settings.textFontFamily)
				.text(function(d) { return d.subtitleValue ; });

			node.append("text")
				.attr("dy", function(d){
					var Circle = d3.select('#' + d.id);
					var MaxDY = eval(Circle.attr('maxdy'));
					return MaxDY + 'px';
				})
				.attr("class", "subtitle")
				.style("text-anchor", "middle")
				.style("cursor", "pointer")
				.style("fill", "rgba(255, 255, 255, 0)")
				.style("font-family", Settings.textFontFamily)
				.text(function(d) { return d.subtitle ; });

			/// EVENTS
			node.on("mouseenter", function(d){
				if (WindowWidth <= 768)
					return;

				var OldRadius = Radiuses[d.id];
				Radiuses[d.id] += 40;
				$({ radius : OldRadius }).animate({ radius : Radiuses[d.id]},{
					duration: 500,
					step: function(now, fx){
						d.radius = now;
					}
				});

				d.borderColor = Settings.hoverBorderColor;
				d.backgroundColor = Settings.hoverBackgroundColor;
				d.textColor = Settings.hoverTextColor;
				d.subtitleColor = Settings.hoverSubtitleColor;

				d3.select(this)
					.select("circle")
					.transition()
					.duration(500)
					.attr("r", function(d) { return Radiuses[d.id]; })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) {
						return d.textColor;
					});

				d3.select(this).select('.title')
					.call(atop)
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				node.select('.subtitle')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				if (Settings.showBullets)
					$('#bullet_' + d.id).addClass('hover');

				bubble.slowMotion = true;
				bubble.fullSpeed = false;
				bubble.friction(0.9);
				bubble.start();

			});
			node.on("mouseleave", function(d){
				if (WindowWidth <= 768)
					return;

				var OldRadius = Radiuses[d.id];
				Radiuses[d.id] -= 40;
				$({ radius : OldRadius }).animate({ radius : Radiuses[d.id]},{
					duration: 500,
					step: function(now, fx){
						d.radius = now;
					}
				});

				d.borderColor = Settings.borderColor;
				d.backgroundColor = Settings.backgroundColor;
				d.textColor = Settings.textColor;
				d.subtitleColor = 'rgba(0,0,0,0)';

				d3.select(this)
					.select("circle")
					.transition()
					.duration(500)
					.attr("r", function(d) { return Radiuses[d.id]; })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) {
						return d.textColor;
					});

				d3.select(this).select('.title')
					.call(atop, false);

				node.select('.subtitle')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				if (Settings.showBullets)
					$('#bullet_' + d.id).removeClass('hover');

				bubble.slowMotion = true;
				bubble.fullSpeed = false;
				bubble.friction(0.9);
				bubble.start();

			});
			node.on("click", function(d){
				var URL = d.url;
				//var win = window.open(URL, '_blank');
				//win.focus();
				window.location.href = URL;
			});

			/// PHYSICS
			function tick(e) {
				node.each(gravity(0.01 * e.alpha))
					.each(collide(0.06))
					.attr("transform", function(d) { return "translate(" + Math.ceil(d.x) + "," + Math.ceil(d.y) + ")"; })
					.attr("cx", function (d) { return d.x; })
					.attr("cy", function (d) { return d.y; });
			}
			function gravity(alpha) {
				return function (d) {
					d.y += (d.cy - d.y) * alpha;
					d.x += (d.cx - d.x) * alpha;
				};
			}
			function collide(alpha) {
				var quadtree = d3.geom.quadtree(FormattedData);
				return function (d) {
					var r = d.radius + padding,
						nx1 = d.x - r,
						nx2 = d.x + r,
						ny1 = d.y - r,
						ny2 = d.y + r;
					quadtree.visit(function (quad, x1, y1, x2, y2) {
						if (quad.point && (quad.point !== d)) {
							var x = d.x - quad.point.x,
								y = d.y - quad.point.y,
								l = Math.sqrt(x * x + y * y),
								r = d.radius + quad.point.radius + (d.id !== quad.point.id) * padding;
							if (l < r) {
								l = (l - r) / l * alpha;
								d.x -= x *= l;
								d.y -= y *= l;
								quad.point.x += x;
								quad.point.y += y;
							}
							if (nx2 > Settings.canvasWidth && Settings.rightBorder)
								d.x -= (nx2 - Settings.canvasWidth) * 0.01;
							if (nx1 < 0 && Settings.leftBorder)
								d.x += Math.abs(nx1) * 0.01;
							if (ny2 > Settings.canvasHeight && Settings.bottomBorder)
								d.y -= (ny2 - Settings.canvasHeight) * 0.01;
							if (ny1 < 0 && Settings.topBorder)
								d.y += Math.abs(ny1) * 0.01;
						}
						return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
					});
				};
			}

			/// TEXT
			function wrap(text) {
				text.each(function()
				{
					var text = d3.select(this),
						circle = d3.select('#' + text.attr('circle-id')),
						words = text.text().split(/[ ]/).reverse(),
						word,
						line = [],
						lineNumber = 0,
						lineHeight = Settings.textFontSize + 3,
						y = 0,
						dy = 0,
						tspan;
					if(words.length >= 3)
						dy = -lineHeight;

					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "px")
					while (word = words.pop())
					{
						line.push(word);
						tspan.text(line.join(" "));
						if (tspan.node().getComputedTextLength() > circle.datum().radius * 2 - 30 && line.length > 1)
						{
							line.pop();
							tspan.text(line.join(" "));
							line = [word];
							tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "px").text(word);
						}
					}
					circle.attr('maxdy', lineNumber * lineHeight + dy);
				});
			}

		}

		function BuildBullets(){
			var HTML = '<div class="canvas-bullets-container">';
			HTML += '<ul>';
			for (var i=0; i < Data.length ;i++)
			{
				var Element = Data[i];
				HTML += '<li>';
				HTML += '<a href="' + Element.url + '" id="bullet_' +  Element.ID +'" data-src-id="' + Element.ID + '">';
				HTML += '<span>' + Element.title + '</span>';
				HTML += '</a>';
				HTML += '</li>';
			}
			HTML += '</ul>';
			HTML += '</div>';

			$('#' + Settings.bulletsContainerID).append(HTML);
			BuildStyles();

			$('#' + Settings.bulletsContainerID + ' .canvas-bullets-container ul li a').hover(function(){
				var CircleID = $(this).data('src-id');
				var CircleData = node.select('#' + CircleID).datum();

				if (WindowWidth <= 768)
					return;

				var OldRadius = Radiuses[CircleID];
				Radiuses[CircleID] += 40;
				$({ radius : OldRadius }).animate({ radius : Radiuses[CircleID]},{
					duration: 500,
					step: function(now, fx){
						CircleData.radius = now;
					}
				});

				CircleData.borderColor = Settings.hoverBorderColor;
				CircleData.backgroundColor = Settings.hoverBackgroundColor;
				CircleData.textColor = Settings.hoverTextColor;
				CircleData.subtitleColor = Settings.hoverSubtitleColor;

				d3.select($('#' + CircleID)[0])
					.transition()
					.duration(500)
					.attr("r", function(d) { return Radiuses[CircleID]; })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) {
						return d.textColor;
					});
				d3.select($('#' + CircleID)[0].parentNode).select('.title')
					.call(atop)
					.style("fill", function(d) {
						return d.subtitleColor;
					});
				node.select('.subtitle')
					.style("fill", function(d) {
						return d.subtitleColor;
					});
				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				bubble.slowMotion = true;
				bubble.fullSpeed = false;
				bubble.friction(0.9);
				bubble.start();

			}, function(){
				var CircleID = $(this).data('src-id');
				var CircleData = node.select('#' + CircleID).datum();

				if (WindowWidth <= 768)
					return;

				var OldRadius = Radiuses[CircleID];
				Radiuses[CircleID] -= 40;
				$({ radius : OldRadius }).animate({ radius : Radiuses[CircleID]},{
					duration: 500,
					step: function(now, fx){
						CircleData.radius = now;
					}
				});

				CircleData.borderColor = Settings.borderColor;
				CircleData.backgroundColor = Settings.backgroundColor;
				CircleData.textColor = Settings.textColor;
				CircleData.subtitleColor = 'rgba(0,0,0,0)';

				d3.select($('#' + CircleID)[0])
					.transition()
					.duration(500)
					.attr("r", function(d) { return Radiuses[CircleID]; })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) {
						return d.textColor;
					});
				d3.select($('#' + CircleID)[0].parentNode).select('.title')
					.call(atop, false);
				node.select('.subtitle')
					.style("fill", function(d) {
						return d.subtitleColor;
					});
				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});

				bubble.slowMotion = true;
				bubble.fullSpeed = false;
				bubble.friction(0.9);
				bubble.start();
			});
		}
		function BuildStyles(){
			var CSS = '';
			for (var i = 0; i < Data.length ;i++)
			{
				var Element = Data[i];
				CSS += '#bullet_' + Element.ID + ':before { background-color: ' + Element.bulletColor + '; } ';
			}

			var style = document.createElement('style');
			style.type = 'text/css';

			if (style.styleSheet)
				style.styleSheet.cssText = CSS;
			else
				style.innerHTML = CSS;

			document.getElementsByTagName("head")[0].appendChild( style );
		}
        function FormatData(Data){
            var R = [];
			
            for (var i=0; i < Data.length ;i++)
            {
                var Element = Data[i];
                var DestinationElement = {
                    packageName: 'Root',
                    title: Element.title,
                    subtitle: Element.subtitle ? Element.subtitle : 'ux-дней опыта',
					subtitleValue: Element.subtitleValue,
                    value: Element.value,
                    url: Element.url,
                    bulletColor: Element.bulletColor,
					textColor: Settings.textColor,
					subtitleColor: 'rgba(0,0,0,0)',
					borderWidth: Settings.borderWidth,
					borderColor: Settings.borderColor,
					backgroundColor: Settings.backgroundColor,
					id: Element.ID,
					index: i,
					cx: Settings.x(i),
					cy: Settings.canvasHeight / 2,
					radius: ( Element.value / MaxValue) * (Settings.maxRadius - Settings.minRadius) + Settings.minRadius
                };

				Radiuses[Element.ID] = DestinationElement.radius;
                R.push(DestinationElement);
            }
			
            return R;
        }
		function SetDataIDs(Data){			
			for (var i=0; i < Data.length ;i++)
            {
                var Element = Data[i];
				Element.ID = ID + '_element_' + i;
			}
			
			return Data;
		}
		//text atop
		function atop(obj, atop = true) {
			var tspans = obj.selectAll("tspan"),
				sizet = tspans.size(),
				lineHeight = Settings.textFontSize + 3,
				modify = lineHeight * 2 + lineHeight * (sizet - 1),
				adjustment = false;

			var first_el = d3.select(tspans[0][0]);
			if (parseInt(first_el.attr('dy'), 10) == -lineHeight && atop) {
				adjustment = true;
				first_el.attr('adjustment', 1);
			}

			if(parseInt(first_el.attr('adjustment'), 10) == 1 && !atop) {
				adjustment = true;
				first_el.attr('adjustment', null);
			}
			
			tspans.each(function()
			{
				var el = d3.select(this),
					top = parseInt(el.attr('dy'), 10),
					calc;
				if (atop)
					calc = top - modify;
				else
					calc = top + modify;

				if (atop && adjustment) 
					calc += lineHeight;
				else if (!atop && adjustment){
					calc -= lineHeight;
				}

				el.attr("dy", calc + "px");
			});
		}
    };
}(jQuery));