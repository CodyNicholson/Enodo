﻿var pattern = "\/([0-9]+)(?=[^\/]*$)";
var url = top.document.location.href.toString();
var index = url.match(pattern)[1];
//var index = url.substr(-1);
//console.log("JNDJFDJF:  " + index);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([30, 0])
  .html(function (d) {
      //console.log(d);
      var num_Members = d.parent.children.length;
      var options = d.parent.parent.options;
      var name = d.name,
                    gender = d.Gender,
                    num = d.num,
                    dm = d.Demographic,
                    ans = d.numanswers,
                    parent = d.parent.name
      country = d.Country
      percentage = (100/num_Members).toFixed(2);
      ;
    //  var top_ans = ans.split(",");

      return "<strong>Name:</strong> <span style='color:red'>" + name + "</span><br/>"
           + "<strong>Gender:</strong> <span style='color:red'>" + gender + "</span><br/>"
           + "<strong>Demographic:</strong> <span style='color:red'>" + dm + "</span><br/>"
           + "<strong>Country:</strong> <span style='color:red'>" + country + "</span><br/>"
           + "<strong>Top Answer:</strong> <span style='color:red'>" + options[ans[0]] + "</span><br/>"
           + "<strong>Lowest Answer:</strong> <span style='color:red'>" + options[ans[ans.length - 1]] + "</span><br/>"
           + "<strong>Cluster Percentage:</strong> <span style='color:red'>" + percentage + "%" + "</span><br/>"
        
             ;
  })

var tip2 = d3.tip()
  .attr('class', 'd3-tip')
  .offset([100, 0])
  .html(function (d) {
     // console.log(d);
     
  
      var percentage = d.dx * 100;

  
      return "<strong>Percentage:</strong> <span style='color:red'>" + percentage.toFixed(2) +"%" + "</span><br/>"
           

      ;
  })


var width = 840,
    height = width+110,
    radius = width / 2,
    x = d3.scale.linear().range([0, 2 * Math.PI]),
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
    padding = 5,
    duration = 1000;
var div = d3.select("#vis");
div.select("img").remove();
var vis = div.append("svg")
    .attr("width", width + padding * 2)
    .attr("height", height + padding * 2)
  .append("g")
    .attr("transform", "translate(" + [radius + padding, radius + padding+110] + ")");
var partition = d3.layout.partition()
    .sort(null)
    .value(function (d) { return 5.8 - d.depth; });
var arc = d3.svg.arc()
    .startAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function (d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function (d) { return Math.max(0, d.y ? y(d.y) : d.y); })
    .outerRadius(function (d) { return Math.max(0, y(d.y + d.dy)); });

vis.call(tip);
vis.call(tip2);

d3.json("/Scripts/_output"+index+".json", function (error, json) {
    var nodes = partition.nodes({ children: json });
    var path = vis.selectAll("path").data(nodes);
    path.enter().append("path")
        .attr("id", function (d, i) { return "path-" + i; })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", colour)
        .on('mouseover', function (d, i) {
            if (!d.children) {
                tip.show.call(this, d, i);
            } else if (d.depth == 2)
            {
                tip2.show.call(this, d, i);
            }
        })
        .on('mouseout', function (d, i) {
            if (!d.children) {
                tip.hide();
            } else if (d.depth == 2) {
                tip2.hide();
            }
        })
        .on("click", click);
    var text = vis.selectAll("text").data(nodes);
    var textEnter = text.enter().append("text")
        .style("fill-opacity", 1)
        .style("fill", function (d) {
            return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
        })
        .attr("text-anchor", function (d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        })
        .attr("dy", ".2em")
        .attr("transform", function (d) {
            var multiline = (d.name || "").split(" ").length > 1,
                angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        })
        .on("click", click)
        
    ;
    textEnter.append("tspan")
        .attr("x", 0)
        .text(function (d) {
            if (!d.children) {

                return d.name.split("@")[0].toUpperCase();
            } else {

                return d.depth ? d.name.split(" ")[0] : "";
            }
        });
    textEnter.append("tspan")
        .attr("x", 0)
        .attr("dy", "1em")
        .text(function (d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
    function click(d) {
        path.transition()
          .duration(duration)
          .attrTween("d", arcTween(d));
        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function (e) {
          
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
          .transition()
            .duration(duration)
            .attrTween("text-anchor", function (d) {
                return function () {
                    return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                };
            })
            .attrTween("transform", function (d) {
                var multiline = (d.name || "").split(" ").length > 1;
                return function () {
                    var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                        rotate = angle + (multiline ? -.5 : 0);
                    return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                };
            })
            .style("fill-opacity", function (e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function (e) {
                d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });
    }
});
function isParentOf(p, c) {
    if (p === c) return true;
    if (p.children) {
        return p.children.some(function (d) {
            return isParentOf(d, c);
        });
    }
    return false;
}
var color = d3.scale.category20c();
function colour(d) {
    return color((d.children ? d : d.parent).name);

}
// Interpolate the scales!
function arcTween(d) {
    var my = maxY(d),
        xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, my]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
    return function (d) {
        return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
    };
}
function maxY(d) {
    return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}
function brightness(rgb) {
    return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
}
