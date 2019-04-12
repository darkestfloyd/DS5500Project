var NormalParticles = function(opts) {
	BodyParticles.call(this, opts);
	this.type = opts.type;
	this.name = opts.name;
}

NormalParticles.prototype.draw = function() {
	// copy scope
	// variables: _this
	// methods: _that
	var _this = this;
	var _that = BodyParticles.prototype;

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
	_that.sankey.call(_this);

	// add links
	_this.linkClass = "link";
	_that.addLinks.call(_this);


	// add nodes
	_this.nodeClass = "node";
	this.addNodes(_this);
	
	// add timer for animation
	_this.move = _that.move;
	_this.getLink = _that.getLink;
	_that.addTimer.call(_this);
}

NormalParticles.prototype.addNodes = function() {
	// copy scope
	var _this = this;

	// svg
	var svg = _this.plot;

	// nodes
	// TODO: handle source node separately
	var node = svg.append("g").selectAll("." + _this.nodeClass)
		      				.data([_this.data.nodes[0]])
		    				.enter().append("g")
		    				.attr("class", "node")
		      				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	if(_this.type == "classified" || _this.type == "all") {
		node.on("mouseover", function(d) {
								d3.select(".tooltip").transition()
                					.duration(200)	
                					.style("opacity", .9);

                				d3.select(".tooltip").html("<p>" + d.name + " : " + ((d.accuracy).toFixed(2))
                										+ "<p>Other : " + ((1-d.accuracy)).toFixed(2))
                									.style("left", (d3.event.pageX - 100) + "px")		
                									.style("top", (d3.event.pageY - 28) + "px");
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
			.attr("stroke", "#000")
			.on("click", function(d) {
				dispatch.trueClicked(d);
			});

		node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.attr("opacity", 1)
			.attr("id", function(d) { return d.name + "-white"; })
			.attr("fill", "#fff")
			.on("click", function(d) {
				dispatch.falseClicked(d);
			});

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

		var elementFocusWhite = node.select("#" + _this.name + "-white");
		var accuracy = d3.select(config.particles.element).selectAll("g[name='" + _this.name + "']").attr("accuracy");
		if(_this.type == "classified") {
			accuracy = 1;
		}
		elementFocusWhite.transition().attr("height", (1-accuracy) * elementFocusWhite.attr("height"));
	} else {
		// TODO: adding nodes for each misclassified part
		var total = 1;
		_this.data.nodes[0].parts.forEach(function(v) {
			node.append("rect")
			.attr("height", function(d) { return (total) * d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.style("fill", v.color)
			.style("stroke", "#000")
			.attr("part", v.name)
			.on("mouseover", function() {
				d3.select(".tooltip").transition()
					.duration(200)	
					.style("opacity", .9);

				d3.select(".tooltip").html("<p>" + v.name + " : " + ((v.h).toFixed(2)))
									.style("left", (d3.event.pageX - 100) + "px")		
									.style("top", (d3.event.pageY - 28) + "px");
				})
			.on("mouseout", function(d) {
				d3.select(".tooltip")
					.transition()		
					.duration(500)		
					.style("opacity", 0);
			})
			.on("click", function() {
				dispatch.falsePartClicked(_this,v.name);
			});
			total -= v.h;
		});
	}


	var otherNodes = svg.append("g").selectAll("." + _this.nodeClass)
		      				.data(_this.data.nodes.slice(1, _this.data.nodes.length))
		    				.enter().append("g")
		      				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		      				.on("mouseover", function(d) {
								d3.select(".tooltip").transition()
                					.duration(200)	
                					.style("opacity", .9);

                				d3.select(".tooltip").html("<p>" + d.name + " : " + ((d.accuracy).toFixed(2))
                										+ "<p>Other : " + ((1-d.accuracy)).toFixed(2))
                									.style("left", (d3.event.pageX - 100) + "px")		
                									.style("top", (d3.event.pageY - 28) + "px");
							})
							.on("mouseout", function(d) {
								d3.select(".tooltip")
									.transition()		
                					.duration(500)		
                					.style("opacity", 0);
							});
		      				
	otherNodes.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.style("fill", function(d) { return d.color; })
			.attr("stroke", "#000");

	otherNodes.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.attr("opacity", 1)
			.attr("id", function(d) { return d.name + "-white"; })
			.attr("fill", "#fff");

	otherNodes.append("text")
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

dispatch.on("trueClicked", function(_this) {
	if(d3.select("." + config.particles.nodeClass).style("cursor") == "pointer") {
		d3.selectAll("." + config.particles.nodeClass).style("cursor","");
		var modelId = d3.selectAll("[name=" + _this.name + "][stroke=" + config.graph.bestLineColor + "]").attr("index");
		d3.json("http://127.0.0.1:5000/main/" + _this.name + "/model=" + modelId + "/view=classified", function(data) {
		//d3.json("data/" + _this.name.toLowerCase() + "-" + modelId + ".json", function(data) {

			// update the confusion matrix
			updateCf(data.confusion_matrix);
			var opts = {};
			opts.data = data;
			opts.width = config.particles.width;
			opts.height = config.particles.height;
			opts.margin = config.particles.margin;
			opts.name = _this.name;
			opts.element = "#particle-focus-viz";
			opts.type = "classified";
			opts.fixedLinks = [
							{"source":0,"target":1,"value":1},
							{"source":0,"target":2,"value":1}
					];
			var p = new NormalParticles(opts);
			p.draw();
		});
	}
});


dispatch.on("falseClicked", function(_this) {
	if(d3.select("." + config.particles.nodeClass).style("cursor") == "pointer") {
		d3.selectAll("." + config.particles.nodeClass).style("cursor","");
		var modelId = d3.selectAll("[name=" + _this.name + "][stroke=" + config.graph.bestLineColor + "]").attr("index");
		d3.json("http://127.0.0.1:5000/main/" + _this.name + "/model=" + modelId + "/view=misclassified/all", function(data) {
			// update the confusion matrix
			updateCf(data.confusion_matrix);
			var opts = {};
			opts.data = data;
			opts.width = config.particles.width;
			opts.height = config.particles.height;
			opts.margin = config.particles.margin;
			opts.name = _this.name;
			opts.element = "#particle-focus-viz";
			opts.type = "misclassified";
			opts.fixedLinks = [
							{"source":0,"target":1,"value":1},
							{"source":0,"target":2,"value":1}
					];
			var p = new NormalParticles(opts);
			p.draw();
		});
	}
});


dispatch.on("falsePartClicked", function(_this, part) {
	if(d3.select("." + config.particles.nodeClass).style("cursor") == "pointer") {
		d3.selectAll("." + config.particles.nodeClass).style("cursor","");
		var modelId = d3.selectAll("[name=" + _this.name + "][stroke=" + config.graph.bestLineColor + "]").attr("index");
		d3.json("http://127.0.0.1:5000/main/" + _this.name + "/model=" + modelId + "/view=misclassified/" + part, function(data) {
		//d3.json("data/" + _this.name.toLowerCase() + "-" + modelId + ".json", function(data) {
			// update the confusion matrix
			updateCf(data.confusion_matrix);
			var opts = {};
			opts.data = data;
			opts.width = config.particles.width;
			opts.height = config.particles.height;
			opts.margin = config.particles.margin;
			opts.name = part;
			opts.element = "#particle-focus-viz";
			opts.type = "classified";
			opts.fixedLinks = [
							{"source":0,"target":1,"value":1},
							{"source":0,"target":2,"value":1}
					];
			var p = new NormalParticles(opts);
			p.draw();
		});
	}
});