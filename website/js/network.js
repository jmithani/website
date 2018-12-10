var RADIUS = 10;
var STROKEWIDTH = 3;
var HEIGHT = (window.innerWidth * .3) > 400 ? (window.innerWidth * .3) : 400;
var WIDTH = (window.innerWidth * .6) > 600 ? 600 : (window.innerWidth * .6);
var DISTANCE = WIDTH / 8;

if (window.innerWidth < 600) {
  RADIUS = 8;
  HEIGHT = 400;
  WIDTH = window.innerWidth - 30;
  DISTANCE = 4;
}

var svg = d3.select("#network")
            .append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT);

var color = d3.scaleOrdinal(d3.schemeCategory20);

// I want the larger nodes to stay closer together
// thx for the formatting help https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
var attractiveForce = d3.forceManyBody()
                        .strength(function(d) {
                          return (+d.num > 1) ? 100 : -3000;
                        });

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", attractiveForce)
    .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2));

d3.json("files/interests.json", function(error, graph) {
  if (error) throw error;

/************* LINKS ***************/
  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", STROKEWIDTH)
      .attr("stroke", "#D8D2E1");

/************* NODES ***************/
  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", function(d) {
          return d.num * RADIUS;
      })
      .attr("fill", function(d) {
        if (+d.num > 1) {
          return "#9260C7";
        } else {
          return "#EBD9FF";
        }
      })
      .attr("opacity", 0.75)
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

/************* LABELS FOR THE NODES ***************/
  var labels = svg.selectAll("text")
        .data(graph.nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dy", function(d) {
          return (+d.num > 1) ? 4 : 2;
        })
        .style("font-size", function(d) {
          return (+d.num > 1) ? 16 : 12;
        })
        .style("text-transform", function(d) {
          return (+d.num > 1) ? "uppercase" : "none";
        })
        .style("opacity", 0.8)
        .text(function(d) { return d.id; })
        .call(d3.drag() // This is one both node and label because right now they are stacked
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

/* For placing on right on nodes, saving for future reference */
        // .attr("dx", function(d) {
        //   return (+d.num > 1) ? 16 : 12;
        // })
        // .attr("dy", function(d) {
        //   console.log(d)
        //   return ".35em";
        // })

  simulation.nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links)
      .distance(function(d) {
        return DISTANCE;
      }); // Keeping all the same for now

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d, i) { return d.x; })
        .attr("cy", function(d, i) { return d.y; });

    labels
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) {return d.y; })
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
