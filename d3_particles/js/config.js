var config = {
	parts : ["Elbow", "Finger", "Forearm", "Hand", "Humerus", "Shoulder", "Wrist"],
	graph: {
		width : 120,
		height : 120,
		margin: {
			top: 20,
			right: 75,
			bottom: 45,
			left: 50
		},
		lineColor: "gray",
		bestLineColor: "red",
		max: {
			width: 240,
			height: 240,
			parent: "#maximize-graph" 
		},
		parent : "#graphs"
	},
	particles: {
		nodeClass: "node",
		element: "#particle-viz",
		width : 300,
		height : 500,
		margin : {
			top: 50,
			right: 50,
			bottom: 50,
			left: 10
		}
	}
}