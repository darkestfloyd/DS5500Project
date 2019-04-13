var BodyParticles = function(opts) {
	this.width = opts.width;
	this.height = opts.height;
	this.margin = opts.margin;
	this.data = opts.data;
	this.data.fixedLinks = opts.fixedLinks;
	this.element = opts.element;
}


BodyParticles.prototype.draw = function() {
	// copy scope
	var _this = this;

	// margin shorthand
	var m = _this.margin;

	// set up canvas
	var parent = d3.select(_this.element);
	parent.html("");
	parent.append("canvas")
	      .attr("width", _this.width)
	      .attr("height", _this.height);

	// set up svg
	var svg = parent.append("svg")
		.attr("width", _this.width)
		.attr("height", _this.height)
		.style("position", "relative")
		.append("g")
		.attr("transform", "translate(" + m.left + "," + m.top + ")");
	_this.plot = svg;

	// initialize sankey
	_this.sankey();

	// add links
	_this.linkClass = "link";
	_this.addLinks();


	// add nodes
	_this.nodeClass = config.particles.nodeClass;
	_this.addNodes();
	

	// add timer for animation
	_this.addTimer();
}


BodyParticles.prototype.addTimer = function() {
	// copy scope
	var _this = this;

	_this.timer = d3.timer(tick, 500);
	_this.particles = [];
	_this.state = 0;
	_this.pause = 0;
	_this.elapsed = 0;
	// timer handler
	function tick(elapsed, time) {
			_this.elapsed = elapsed;
		  	if(_this.pause == 1) {
		  		_this.state += _this.elapsed;
		  		return true;
		  	}

		    var links = _this.data.links;
		    var l = {};
		    for(i in links) {
		    	var l = _this.getLink(links[i].source, links[i].target)[0];
		    	var p = d3.select("path[source=" + _this.data.nodes[links[i].source].name + "][target=" + _this.data.nodes[links[i].target].name + "]").node();
		    	if (links[i].current  < links[i].count) {
		    		var offset = (Math.random() - .5) * l.dy;
		    		_this.particles.push({link: l, time: elapsed, color: links[i].color, size: 3, offset: offset, path: p})
		    	}
		    	links[i].current += 1;
		    }
		    
		    if(_this.particles.length == 0) {
		    	d3.selectAll("." + _this.nodeClass).style("cursor", "pointer");
		    	return true;
		    }

		    // particle path
		    _this.move();
	}
}

BodyParticles.prototype.sankey = function() {
	// copy scope
	var _this = this;

	// margin shorthand
	var m = _this.margin;

	// adjust width and height
	var w = _this.width - m.left - m.right;
	var h = _this.height - m.top - m.bottom;

	// setup sankey
	_this.sankey = d3.sankey()
    	.nodeWidth(15)
    	.nodePadding(10)
    	.size([w, h]);
    _this.path = _this.sankey.link();
	_this.sankey
		.nodes(_this.data.nodes)
		.links(_this.data.fixedLinks)
		.layout(32);
}
BodyParticles.prototype.getLink = function(source, target) {
	var _this = this;
	var data = this.data.fixedLinks.filter(function(d) {
		return d.source.name == _this.data.nodes[source].name && d.target.name == _this.data.nodes[target].name;
	});
	return data;
}
BodyParticles.prototype.addLinks = function() {
	// copy scope
	var _this = this;

	// svg
	var svg = _this.plot;

	// links
	var link = svg.append("g").selectAll("." + _this.linkClass)
		      				.data(_this.data.fixedLinks)
		    				.enter().append("path")
		    				.attr("source", function(d) { return d.source.name; })
		    				.attr("target", function(d) { return d.target.name; })
		      				.attr("class", _this.linkClass)
		      				.attr("d", _this.path)
		      				.style("stroke-width", function(d) { return Math.max(1, d.dy); })
		      				.sort(function(a, b) { return b.dy - a.dy; });
	_this.data.links.forEach(function (link) {
	    link.particleSize = 3;
	    link.current = 0;
	});
}

BodyParticles.prototype.addNodes = function() {
	// copy scope
	var _this = this;

	// svg
	var svg = _this.plot;

	// nodes
	var node = svg.append("g").selectAll("." + _this.nodeClass)
		      				.data(_this.data.nodes)
		    				.enter().append("g")
		    				.attr("class", _this.nodeClass)
		    				.attr("accuracy", function(d) { return d.accuracy; })
		    				.attr("name", function(d) { return d.name; })
		      				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		      				.on("click", function(d) {
								dispatch.nodeClicked(d);
							})
							.on("mouseover", function(d) {
								if(d.name != "Input") {
									d3.select(".tooltip").transition()
                					.duration(200)	
                					.style("opacity", .9);
                					d3.select(".tooltip").html("<p>" + d.name + " : " + (((d.accuracy).toFixed(2)*100).toFixed(2) + "%")
                										+ "<p>Other : " + (((1-d.accuracy)).toFixed(2)*100).toFixed(2) + "%")
                									.style("left", (d3.event.pageX + 10) + "px")		
                									.style("top", (d3.event.pageY - 28) + "px");
                				}
							})
							.on("mouseout", function(d) {
								d3.select(".tooltip")
									.transition()		
                					.duration(500)		
                					.style("opacity", 0);
							});

	node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.style("fill", function(d) { return d.color; })
			.attr("stroke", "#000");

	node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.attr("id", function(d) { return d.name + "-white"; })
			.attr("fill", "#fff")
			.attr("stroke", "none");

	node.append("text")
		      .attr("x", -6)
		      .attr("y", function(d) { return d.dy / 2; })
		      .attr("dy", ".35em")
		      .attr("text-anchor", "end")
		      .attr("transform", null)
		      .text(function(d) { return d.name; })
		    	.filter(function(d) { return d.x < _this.width / 2; })
		      .attr("x", 6 + _this.sankey.nodeWidth())
		      .attr("text-anchor", "start");

}

BodyParticles.prototype.move = function() {
	// copy scope
	var _this = this;

	// shorthand for margin
	var m = _this.margin;

	// shorthand for particles
	var p = _this.particles;

	// particle animation
	var context = d3.select(_this.element).select("canvas").node().getContext("2d");
	context.fillStyle = "gray";
	context.lineWidth = "1px";
	context.clearRect(0, 0, _this.width, _this.height);
	for (var x in p) {
		var currentTime = _this.elapsed - p[x].time;
		var currentPercent = currentTime / 1000 * p[x].path.getTotalLength();
		var currentPos = p[x].path.getPointAtLength(currentPercent/1.5);
		if(currentPos.x < p[x].link.target.x) {
      		context.beginPath();
      		context.fillStyle = p[x].color;
      		context.arc(m.left + currentPos.x, m.top + currentPos.y + p[x].offset,
      		p[x].size, 0, 2*Math.PI);
      		context.fill();
		} else {
			if (!("done" in p[x])) {
				p[x].done = true;
				accuracy = p[x].link.target.accuracy;
				var h = p[x].link.target.dy * accuracy;
				var elementWhite = d3.select(_this.element).select("#" + p[x].link.target.name + "-white");
				elementWhite.transition().duration(500).attr("height", p[x].link.target.dy-h);
				p.splice(x, 1);
			}
		}
	}
}

dispatch.on("nodeClicked.particles", function(_this) {
	//if(_main.particles.length == 0) {
		if(_this.name == "Input") {
			d3.selectAll("." + config.particles.nodeClass).style("opacity", 1);
		}
		if(d3.select("." + config.particles.nodeClass).style("cursor") == "pointer") {
			d3.selectAll("." + config.particles.nodeClass).style("cursor","");
			var modelId = d3.selectAll("[name=" + _this.name + "][stroke=" + config.graph.bestLineColor + "]").attr("index");
			d3.json("http://127.0.0.1:5000/main/" + _this.name + "/model=" + modelId + "/view=all", function(data) {
			//d3.json("data/" + _this.name.toLowerCase() + "-" + modelId + ".json", function(data) {
				// update the confusion matrix
				d3.selectAll("." + config.particles.nodeClass).style("opacity", 0.2);
				d3.select("g[name=" + _this.name + "]").style("opacity", 1);
				updateCf(data.confusion_matrix);
				var opts = {};
				opts.data = data;
				opts.width = config.particles.width;
				opts.height = config.particles.height;
				opts.margin = config.particles.margin;
				opts.name = _this.name;
				opts.element = "#particle-focus-viz";
				opts.type = "all";
				opts.fixedLinks = [
							{"source":0,"target":1,"value":1},
							{"source":0,"target":2,"value":1}
					];
				var p = new NormalParticles(opts);
				p.draw();
			});
		}
	//}
});