var margin = {top: 10, bottom: 10, left: 10, right: 10, between:30};
var height = 550 - margin.top - margin.bottom,
  width = 1200 - margin.left - margin.right;
var groupCamWidth = (width - margin.between) / 2, groupCamHeight = height;

var svg = d3.select("#svg_div")
  .append("svg")
  .attr("id", "gradcam_svg")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

var studyCam = svg.append("g")
  .attr("id", "study_svg")
  .attr("transform", `translate(0, 0)`);

// studyCam.append("rect").attr("height", groupCamHeight).attr("width", groupCamWidth).attr("fill", "none");
// studyCam.append("div")
// studyCam.append("svg:image").attr("class", "color").attr("height", 350).attr("width", 350).attr("xlink:href", "cams/CAM0_5.jpg")
  // .attr("x", `${(groupCamWidth - 350) / 2}`).attr("y", 10);
// studyCam.append()

function addGradView(container, cam_paths, id_prefix) {
  
  cam_names = ["_MAIN", "_SUB_1", "_SUB_2", "_SUB_3","_SUB_4", "_SUB_5"]
  cam_size = [{h: 350, w: 350}]
  cam_pos = [{x: (groupCamWidth - cam_size[0].w) / 2, y: 10}]

  for (i = 0; i < 1; ++i) {
    console.log("loop", i);
    container.append("svg:image")
      .attr("id", id_prefix + cam_names[i])
      .attr("class", "color")
      .attr("height", cam_size[i].h).attr("width", cam_size[i].w)
      .attr("xlink:href", cam_paths[i])
      .attr("x", cam_pos[i].x).attr("y", cam_pos[i].y);
  }

   // container.append("svg:image")
    // .attr("id", id_prefix + "_MAIN")
    // .attr("class", "color")
    // .attr("height", 350).attr("width", 350)
    // .attr("xlink:href", cam_paths[0])
    // .attr("x", `${(groupCamWidth - 350) / 2}`).attr("y", 10);
}

addGradView(studyCam, ["cams/CAM0_5.jpg", "cams/CAM0_10.jpg"], "studyCam");

var classCam = svg.append("g")
  .attr("id", "class_svg")
  .attr("transform", `translate(${groupCamWidth + margin.between}, 0)`);

// classCam.append("rect").attr("height", groupCamHeight).attr("width", groupCamWidth).attr("fill", "gray");
addGradView(classCam, ["cams/CAM0_10.jpg"]);
