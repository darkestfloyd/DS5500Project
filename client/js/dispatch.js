/*
Events:
lineClicked : clicking on a line chart
plusClicked : clicking on a plus button
minusClicked : clicling on a minus button
*/

// lineClicked

var dispatch = d3.dispatch("lineClicked", "plusClicked", "minusClicked", "nodeClicked", "trueClicked", "falseClicked", "falsePartClicked");