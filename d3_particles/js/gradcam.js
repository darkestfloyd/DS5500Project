var logger = 0;
// define some dimensions
var margin = {top: 10, bottom: 10, left: 10, right: 10, between: 70, sm_between: 20};
var height = 800 - margin.top - margin.bottom,
  width = 800 - margin.left - margin.right;
var groupCamWidth = (width - margin.between) / 2, groupCamHeight = height;
var mainCamWidth = 300, mainCamHeight = 300;
var subCamWidth = 60, subCamHeight = 60;

// add the main svg
var svg = d3.select("#svg_div")
  .append("svg")
  .style("position", "relative")
  .attr("id", "gradcam_svg")
  .attr("height", height)
  .attr("width", width)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var colorbar_svg = d3.select("#colorbar_svg")
var colorbar_def = colorbar_svg.append("defs");
var linearGradient = colorbar_def.append("linearGradient").attr("id", "linear-gradient");

linearGradient
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");
//Set the color for the start (0%)
linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#0102FB") //light blue

//Set the color for the end (100%)
linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#00FC80"); //dark blue
//Draw the rectangle and fill with gradient
colorbar_svg.append("rect")
    .attr("width", 30)
    .attr("height", 200)
    .style("fill", "url(#linear-gradient)");


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
function addGradView(container, cam_paths, id_prefix,
              title, label_pred, label_true) {
  
  var subCamStartX = (groupCamWidth / 2) - (subCamWidth + 
    margin.sm_between + subCamWidth + margin.sm_between/2),
    subCamStartY = 80 + mainCamHeight + 30,
    selectedImg = 3;

  // add the line acting as x axis
  container.append("line")
    .attr("id", id_prefix + "_axis")
    .attr("x1", subCamStartX - 10)
    .attr("y1", subCamStartY + subCamHeight + 10)
    .attr("x2", groupCamWidth - subCamStartX + 10)
    .attr("y2", subCamStartY + subCamHeight + 10)
    .attr("stroke-width", 1)
    .attr("stroke", "black");

  // add "Iteration" text 
  container.append("text")
      .attr("id", id_prefix + "_iter")
      .attr("y", subCamStartY + subCamHeight + 60)
      .attr("x", (groupCamWidth / 2) - 40)
      .attr("font-size", "18px")
      .text(function(d) { return "Iteration"; });

  // add title text
  container.append("text")
      .attr("y", 25) 
      .attr("x", (groupCamWidth / 2) - 4.8 * title.length)
      .attr("font-size", "18px")
      .text(function(d) { return title; });

  // add other text
  ttext = "True: " + label_true + "; Pred: " + label_pred; 
  container.append("text")
      .attr("y", 50)
      .attr("font-size", "18px")
      .attr("x", (groupCamWidth / 2) - 5 * ttext.length)
      .attr("id", id_prefix + "_subtitle")
      .text(function(d) { return "True: " + label_true + "; Pred: " + label_pred; });

  // add each image in this loop, 0 is main image, 1,2,3,4 are small multiples
  for (i = 0; i < 5; ++i) {

    if (i == 0) {
      // 0 is main, do main related stuff
      var cam_name = "_MAIN",
        cam_size = {h: mainCamHeight, w: mainCamWidth},
        cam_pos = {x: (groupCamWidth - cam_size.w) / 2, y: 80},
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
      .attr("x", cam_pos.x).attr("y", cam_pos.y)
      .on("click", function(_, __, obj) { // on click
        obj = obj[0]
        cam = obj.id.slice(0, 8)
        selected = +obj.id[obj.id.length - 1];
        console.log("#" + cam + "_MAIN");

        // update main cam
        d3.select("#" + cam + "_MAIN")
          .attr("xlink:href", obj.href.baseVal);

        // update grayscale
        for (i = 1; i < 5; ++i) {
          var s = d3.select("#" + cam + "_SUB_" + i);
          if (i == selected)
            s.attr("class", "color");
          else
            s.attr("class", "gray")
        }

      });

    // if small multiple, also add its iteration
    if (i > 0) {
      container.append("text")
        .attr("id", id_prefix + "_SUBTEXT_" + i)
        .attr("x", cam_pos.x + subCamWidth/2)
        .attr("y", cam_pos.y + 1.5 * subCamHeight)
        .attr("font-size", "15px")
        .text(function(d) { return i * 5; });
    }
  }

}

function updateCams(new_study_paths, study_true, study_pred,
                    new_class_paths, class_true, class_pred, is_uploaded = false) {
  console.log("updating cams");

  // study
  d3.select("#studyCam_MAIN").attr('xlink:href', new_study_paths[3]);
  d3.select("#studyCam_SUB_1").attr('xlink:href', new_study_paths[0]);
  d3.select("#studyCam_SUB_2").attr('xlink:href', new_study_paths[1]);
  d3.select("#studyCam_SUB_3").attr('xlink:href', new_study_paths[2]);
  d3.select("#studyCam_SUB_4").attr('xlink:href', new_study_paths[3]);

  // class
  d3.select("#classCam_MAIN").attr('xlink:href', new_class_paths[0]);
  d3.select("#classCam_SUB_1").attr('xlink:href', new_class_paths[0]);
  d3.select("#classCam_SUB_2").attr('xlink:href', new_class_paths[1]);
  d3.select("#classCam_SUB_3").attr('xlink:href', new_class_paths[2]);
  d3.select("#classCam_SUB_4").attr('xlink:href', new_class_paths[3]);

  // subtitle
  d3.select("#studyCam_subtitle").text("True: " + study_true + "; Pred: " + study_pred);
  d3.select("#classCam_subtitle").text("True: " + class_true + "; Pred: " + class_pred);

}

function updateCams_uploaded(study_path, study_label, class_path, class_label) {

  console.log(study_path)
  d3.select("#studyCam_MAIN").attr('xlink:href', study_path);
  d3.select("#classCam_MAIN").attr('xlink:href', class_path);

  d3.select("#studyCam_subtitle").text("Predicted label: " + study_label);
  d3.select("#classCam_subtitle").text("Predicted label: " + class_label);

  // hide all others cams and lines
  // study
  d3.select("#studyCam_SUB_1").style("opacity", 0);
  d3.select("#studyCam_SUB_2").style("opacity", 0);
  d3.select("#studyCam_SUB_3").style("opacity", 0);
  d3.select("#studyCam_SUB_4").style("opacity", 0);

  // class
  d3.select("#classCam_SUB_1").style("opacity", 0);
  d3.select("#classCam_SUB_2").style("opacity", 0);
  d3.select("#classCam_SUB_3").style("opacity", 0);
  d3.select("#classCam_SUB_4").style("opacity", 0);

  // others
  d3.select("#studyCAM_axis").style("opacity", 0);
  d3.select("#classCAM_axis").style("opacity", 0);
  d3.select("#studyCAM_iter").style("opacity", 0);
  d3.select("#classCAM_iter").style("opacity", 0);

  for (i = 1; i < 5; ++i) {
    d3.select("#studyCAM_SUBTEXT_" + i).style("opacity", 0);
    d3.select("#classCAM_SUBTEXT_" + i).style("opacity", 0);
  }
}

// adds a container for the left gradcam and populate
var studyCam = svg.append("g")
  .attr("id", "study_svg")
  .attr("transform", `translate(0, 0)`);

var studyCam_paths = ["cams/CAM0_5.jpg", "cams/CAM0_10.jpg", "cams/CAM0_15.jpg", 
  "cams/CAM0_20.jpg"]
addGradView(studyCam, studyCam_paths, "studyCam", "Study Type Prediction", "Hand", "Hand");

// add and populate class cam container
var classCam = svg.append("g")
  .attr("id", "class_svg")
  .attr("transform", `translate(${groupCamWidth + margin.between}, 0)`);

var classCam_paths = ["cams/CAM1_5.jpg", "cams/CAM1_10.jpg", "cams/CAM1_15.jpg", 
  "cams/CAM1_20.jpg"]
addGradView(classCam, classCam_paths, "classCam", "Class Type Prediction", "Abnormal", "Normal");

// svg.append("g")
  // .attr("transform", `translate(${width/2 - 30}, 100)`)
  // .append("button").attr("id", "generate");
