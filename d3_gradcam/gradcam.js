var margin = {top: 10, bottom: 10, left: 10, right: 10, between: 50, sm_between: 20};
var height = 700 - margin.top - margin.bottom,
  width = 1200 - margin.left - margin.right;
var groupCamWidth = (width - margin.between) / 2, groupCamHeight = height;
var mainCamWidth = 400, mainCamHeight = 400;
var subCamWidth = 100, subCamHeight = 100;

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
  
  var subCamStartX = (groupCamWidth / 2) - (subCamWidth + 
    margin.sm_between + subCamWidth + margin.sm_between/2),
    subCamStartY = 10 + mainCamHeight + 30,
    selectedImg = 3;

  container.append("line")
    .attr("x1", subCamStartX - 10)
    .attr("y1", subCamStartY + subCamHeight + 10)
    .attr("x2", groupCamWidth - subCamStartX + 10)
    .attr("y2", subCamStartY + subCamHeight + 10)
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  for (i = 0; i < 5; ++i) {
    console.log("loop", i);

    if (i == 0) {
      var cam_name = "_MAIN",
        cam_size = {h: mainCamHeight, w: mainCamWidth},
        cam_pos = {x: (groupCamWidth - cam_size.w) / 2, y: 10},
        cam_class = "color",
        cam_path = cam_paths[selectedImg];
    } else {
      var cam_name = "_SUB_" + i,
        cam_size = {h: subCamHeight, w: subCamWidth},
        cam_pos = {x: subCamStartX + ((i-1) * (subCamWidth + margin.sm_between)), 
          y: subCamStartY},
        cam_path = cam_paths[i - 1];

      if ((i - 1) == selectedImg)
        var cam_class = "color";
      else
        var cam_class = "gray";
    }

    container.append("image")
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
