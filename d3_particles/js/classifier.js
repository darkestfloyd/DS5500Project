var NormalParticles = function(opts) {
	BodyParticles.call(this, opts);
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
		      				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.style("fill", function(d) { return d.color; })
			.style("stroke", "none")
			.on("click", function(d) {
				dispatch.trueClicked(d);
			});

	node.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.attr("opacity", 1)
			.attr("id", function(d) { return d.name + "-white"; })
			.attr("fill", "#fff")
			.attr("stroke", "#000")
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
	elementFocusWhite.transition().attr("height", (1-accuracy) * elementFocusWhite.attr("height"));


	var otherNodes = svg.append("g").selectAll("." + _this.nodeClass)
		      				.data(_this.data.nodes.slice(1, _this.data.nodes.length))
		    				.enter().append("g")
		      				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		      				
	otherNodes.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.style("fill", function(d) { return d.color; })
			.style("stroke", "none");

	otherNodes.append("rect")
			.attr("height", function(d) { return d.dy; })
			.attr("width", _this.sankey.nodeWidth())
			.attr("opacity", 1)
			.attr("id", function(d) { return d.name + "-white"; })
			.attr("fill", "#fff")
			.attr("stroke", "#000");

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
	console.log("true clicked");
});


dispatch.on("falseClicked", function(_this) {
	console.log("false clicked");
});