(function ($){

    $.fn.bubbles = function(Options) {

        var Settings = $.extend({
            minRadius: 35,
            maxRadius: 125,
			canvasWidth: 900,
			canvasHeight: 600,
			textFontFamily: 'Arial',
			textColor: 'rgba(255, 255, 255, 0.5)',
			hoverTextColor: 'rgba(255, 255, 255, 0.8)',
			hoverSubtitleColor: '#68bee0',
			borderWidth: 2,
            borderColor: 'rgba(255, 255, 255, 0.9)',
            hoverBorderColor: 'rgba(255, 255, 255, 0.9)',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            hoverBackgroundColor: 'rgba(255, 255, 255, 1)',
            data: [],
			showBullets: false,
			bulletsContainerID: '',
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
		if (ContainerWidth < Settings.canvasWidth)
		{
			Settings.canvasWidth = ContainerWidth;
			OldCanvasWidth = ContainerWidth;
		}

		Settings.bulletsContainerID = (Settings.bulletsContainerID != '' ? Settings.bulletsContainerID : ID);

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
			
			format = d3.format(",d"),
            color = d3.scale.category20c();

			bubble = d3.layout.pack()
				.sort(function(a, b){ return a.title.length - b.title.length; })
				.radius(function(Element) { 
					return (Element / MaxValue) * (Settings.maxRadius - Settings.minRadius) + Settings.minRadius
				})
				.size([Settings.canvasWidth, Settings.canvasHeight])
				.padding(10);

			svg = d3.select('#' + ID).append('svg')
				.attr("width", Settings.canvasWidth)
				.attr("height", Settings.canvasHeight)
				.attr("class", "bubble");

			FormattedData = FormatData(Data);

			node = svg.selectAll(".node")
				.data(bubble.nodes(FormattedData).filter(function(d) { return !d.children; }))
				.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

			node.append("circle")
				.attr("r", function(d) { return d.r; })
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
				.text(function(d) { return d.title; })
				.call(wrap);

			node.append("text")
				.attr("dy", function(d){
					var Circle = d3.select('#' + d.id);
					/// var MaxDY = eval(Circle.attr('maxdy'));
					Circle.attr('maxdy', Settings.valueFontSize * 0.6);
					return Settings.valueFontSize * 0.3 + 'px';
				})
				.attr("class", "subtitle-value")
				.style("text-anchor", "middle")
				.style("cursor", "pointer")
				.style("fill", "rgba(255, 255, 255, 0)")
				.style("font-size", Settings.valueFontSize)
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

			/// NODE EVENTS
			node.on("mouseover", function(d){
				if (WindowWidth <= 768)
					return;

				d.value += 1;
				d.borderColor = Settings.hoverBorderColor;
				d.backgroundColor = Settings.hoverBackgroundColor;
				d.textColor = Settings.hoverTextColor;
				d.subtitleColor = Settings.hoverSubtitleColor;
				
				node.data(bubble.nodes(FormattedData), function(d) { return d.title; })
					.transition()
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.select("circle")
					.attr("r", function(d) { return d.r })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) { 
						return d.textColor; 
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

			});

			node.on("mouseout", function(d){
				if (WindowWidth <= 768)
					return;
				
				d.value -= 1;
				d.borderColor = Settings.borderColor;
				d.backgroundColor = Settings.backgroundColor;
				d.textColor = Settings.textColor;
				d.subtitleColor = 'rgba(0,0,0,0)';
				
				node.data(bubble.nodes(FormattedData), function(d) { return d.title; })
					.transition()
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.select("circle")
					.attr("r", function(d) { return d.r })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });

				node.select("text")
					.style("fill", function(d) { 
						return d.textColor; 
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
					$('#bullet_' + d.id).removeClass('hover');

			});

			node.on("click", function(d){
				var URL = d.url;
				var win = window.open(URL, '_blank');
				win.focus();
			});
		}
		function BuildBullets(){
			var HTML = '<div class="canvas-bullets-container">';
			HTML += '<ul>';
			for (var i=0; i < Data.length ;i++)
            {
				var Element = Data[i];
				HTML += '<li>';
				HTML += '<a href="' + Element.url + '" target="_blank" id="bullet_' +  Element.ID +'" data-src-id="' + Element.ID + '">';
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
				
				CircleData.value += 1;
				CircleData.borderColor = Settings.hoverBorderColor;
				CircleData.backgroundColor = Settings.hoverBackgroundColor;
				CircleData.textColor = Settings.hoverTextColor;
				CircleData.subtitleColor = Settings.hoverSubtitleColor;

				
				node.data(bubble.nodes(FormattedData), function(d) { return d.title; })
					.transition()
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.select("circle")
					.attr("r", function(d) { return d.r })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });
				node.select("text")
					.style("fill", function(d) { 
						return d.textColor; 
					});
				node.select('.subtitle')
					.style("fill", function(d) { 
						return d.subtitleColor;
					});
				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});
				
			}, function(){
				var CircleID = $(this).data('src-id');							
				var CircleData = node.select('#' + CircleID).datum();
				
				if (WindowWidth <= 768)
					return;
				
				CircleData.value -= 1;
				CircleData.borderColor = Settings.borderColor;
				CircleData.backgroundColor = Settings.backgroundColor;
				CircleData.textColor = Settings.textColor;
				CircleData.subtitleColor = 'rgba(0,0,0,0)';
				
				node.data(bubble.nodes(FormattedData), function(d) { return d.title; })
					.transition()
					.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
					.select("circle")
					.attr("r", function(d) { return d.r })
					.style("stroke", function(d) { return d.borderColor; })
					.style("fill", function(d) { return d.backgroundColor; });
				node.select("text")
					.style("fill", function(d) { 
						return d.textColor; 
					});
				node.select('.subtitle')
					.style("fill", function(d) { 
						return d.subtitleColor; 
					});
				node.select('.subtitle-value')
					.style("fill", function(d) {
						return d.subtitleColor;
					});
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
            var R = { children: [] };			
			
            for (var i=0; i < Data.length ;i++)
            {
                var Element = Data[i];
                var DestinationElement = {
                    packageName: 'Root',
                    title: Element.title,
                    subtitle: Element.subtitle,
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
					/// radius: (Element.value / MaxValue) * (Settings.maxRadius - Settings.minRadius) + Settings.minRadius
                };
                R.children.push(DestinationElement);
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
						tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "px");
					while (word = words.pop()) 
					{
						line.push(word);
						tspan.text(line.join(" "));
						if (tspan.node().getComputedTextLength() > circle.datum().r * 2 - 30 && line.length > 1) 
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
    };
}(jQuery));