// define some dimensions
var margin = {top: 10, bottom: 10, left: 10, right: 10, between: 150, sm_between: 20};
var height = 900 - margin.top - margin.bottom,
  width = 1200 - margin.left - margin.right;
var groupCamWidth = (width - margin.between) / 2, groupCamHeight = height;
var mainCamWidth = 400, mainCamHeight = 400;
var subCamWidth = 100, subCamHeight = 100;

// add the main svg
var svg = d3.select("#svg_div")
  .append("svg")
  .attr("id", "gradcam_svg")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)

// this function will add a "GradCamView" to a container. This includes the main image with the
// small multiples and all the related text. 
//
// container is a "g" tag 
// cam_paths are the paths to the cam images, this is a length 4 array, where image paths 
//   are sequential. idx 0 is cam image for iter 5, idx 1 for iter 10, so on
// id_prefix each image has an id, which will make it easier to manipulate,
//    main img is of the form "id_prefix_MAIN"
//    sub image, is based on iter and in sequence "id_prefix_SUB_i" where i is image number from
//      left, stating at 1 [_SUB_1 to _SUB_4]
function addGradView(container, cam_paths, id_prefix) {
  
  var subCamStartX = (groupCamWidth / 2) - (subCamWidth + 
    margin.sm_between + subCamWidth + margin.sm_between/2),
    subCamStartY = 10 + mainCamHeight + 30,
    selectedImg = 3;

  // add the line acting as x axis
  container.append("line")
    .attr("x1", subCamStartX - 10)
    .attr("y1", subCamStartY + subCamHeight + 10)
    .attr("x2", groupCamWidth - subCamStartX + 10)
    .attr("y2", subCamStartY + subCamHeight + 10)
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  // add "Iteration" text 
  container.append("text")
      .attr("y", subCamStartY + subCamHeight + 60)
      .attr("x", (groupCamWidth / 2) - 40)
      .attr("font-size", "18px")
      .text(function(d) { return "Iteration"; });

  // add each image in this loop, 0 is main image, 1,2,3,4 are small multiples
  for (i = 0; i < 5; ++i) {

    if (i == 0) {
      // 0 is main, do main related stuff
      var cam_name = "_MAIN",
        cam_size = {h: mainCamHeight, w: mainCamWidth},
        cam_pos = {x: (groupCamWidth - cam_size.w) / 2, y: 10},
        cam_class = "color",
        cam_path = cam_paths[selectedImg];
    } else {
      // others are the small multiples
      var cam_name = "_SUB_" + i,
        cam_size = {h: subCamHeight, w: subCamWidth},
        cam_pos = {x: subCamStartX + ((i-1) * (subCamWidth + margin.sm_between)), 
          y: subCamStartY},
        cam_path = cam_paths[i - 1];

      // selected small multuple is not gray, by default, last iter is selected
      if ((i - 1) == selectedImg)
        var cam_class = "color";
      else
        var cam_class = "gray";
    }

    // add the image with defined vars
    container.append("image")
      .attr("id", id_prefix + cam_name)
      .attr("class", cam_class)
      .attr("height", cam_size.h).attr("width", cam_size.w)
      .attr("xlink:href", cam_path)
      .attr("x", cam_pos.x).attr("y", cam_pos.y);

    // if small multiple, also add its iteration
    if (i > 0) {
      container.append("text")
        .attr("x", cam_pos.x + 45)
        .attr("y", cam_pos.y + 130)
        .attr("font-size", "15px")
        .text(function(d) { return i * 5; });
    }
  }

}


// adds a container for the left gradcam and populate
var studyCam = svg.append("g")
  .attr("id", "study_svg")
  .attr("transform", `translate(0, 100)`);

var studyCam_paths = ["cams/CAM0_5.jpg", "cams/CAM0_10.jpg", "cams/CAM0_15.jpg", 
  "cams/CAM0_20.jpg"]
addGradView(studyCam, studyCam_paths, "studyCam");

// add and populate class cam container
var classCam = svg.append("g")
  .attr("id", "class_svg")
  .attr("transform", `translate(${groupCamWidth + margin.between}, 100)`);

var classCam_paths = ["cams/CAM1_5.jpg", "cams/CAM1_10.jpg", "cams/CAM1_15.jpg", 
  "cams/CAM1_20.jpg"]
addGradView(classCam, classCam_paths, "classCam");