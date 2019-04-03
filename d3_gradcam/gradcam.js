var margin = {top: 10, bottom: 10, left: 10, right: 10, between: 30, sm_between: 10};
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

function addGradView(container, cam_paths, id_prefix) {
  
  sub_cam_start = (groupCamWidth / 2) - (100+10+100+5)

  for (i = 0; i < 6; ++i) {
    console.log("loop", i);

    if (i == 0) {
      var cam_name = "_MAIN",
        cam_size = {h: 350, w: 350},
        cam_pos = {x: (groupCamWidth - cam_size.w) / 2, y: 10},
        cam_class = "color",
        cam_path = cam_paths[3];
    } else {
      var cam_name = "_SUB_" + i,
        cam_size = {h: 100, w: 100},
        cam_pos = {x: sub_cam_start + ((i-1) * 110), y: 10 + 350 + 10},
        cam_class = "gray",
        cam_path = cam_paths[i - 1];
    }

    container.append("svg:image")
      .attr("id", id_prefix + cam_name)
      .attr("class", cam_class)
      .attr("height", cam_size.h).attr("width", cam_size.w)
      .attr("xlink:href", cam_path)
      .attr("x", cam_pos.x).attr("y", cam_pos.y);
  }

}

var studyCam_paths = ["cams/CAM0_5.jpg", "cams/CAM0_10.jpg", "cams/CAM0_15.jpg", 
  "cams/CAM0_20.jpg"]
addGradView(studyCam, studyCam_paths, "studyCam");

var classCam = svg.append("g")
  .attr("id", "class_svg")
  .attr("transform", `translate(${groupCamWidth + margin.between}, 0)`);

var classCam_paths = ["cams/CAM1_5.jpg", "cams/CAM1_10.jpg", "cams/CAM1_15.jpg", 
  "cams/CAM1_20.jpg"]
addGradView(classCam, classCam_paths, "classCam");
