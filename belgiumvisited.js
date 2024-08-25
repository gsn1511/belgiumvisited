const HOVER_COLOR = "#EFAE88";
const MAP_COLOR = "#fff2e3";
let cityCount = localStorage.getItem("selectedCities")
  ? JSON.parse(localStorage.getItem("selectedCities")).length
  : 0;
document.getElementById("city_count").innerHTML = cityCount;

d3.json("be-cities.json").then(function (data) {
  let width = 1200;
  height = 900;
  let projection = d3.geoEqualEarth();
  projection.fitSize([width, height], data);
  let path = d3.geoPath().projection(projection);

  let svg = d3
    .select("#map_container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let g = svg.append("g")

  let zoom = d3.zoom()
    .scaleExtent([1, 8]) 
    .on("zoom", function (event) {
      g.attr("transform", event.transform);
    });

  svg.call(zoom); 

  g.selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", path)
    .attr("fill", function (d, i) {
      if (localStorage.getItem("selectedCities")) {
        if (
          JSON.parse(localStorage.getItem("selectedCities")).includes(
            d.properties.Communes
          )
        ) {
          d.noFill = true;
          return HOVER_COLOR;
        } else return MAP_COLOR;
      } else return MAP_COLOR;
    })
    .attr("stroke", "#000")
    .on("mouseover", function (d, i) {
      d3.select(this).attr("fill", HOVER_COLOR);
    })
    .on("mouseout", function (d, i) {
      if (!d.noFill) d3.select(this).attr("fill", MAP_COLOR);
    })
    .on("click", function (d, i) {
      d.noFill = d.noFill || false;
      if (!d.noFill) {
        cityCount++;
        document.getElementById("city_count").innerHTML = cityCount;
        d3.select(this).attr("fill", HOVER_COLOR);

        //add selected city to localStorage
        if (localStorage.getItem("selectedCities")) {
          let tempSelectedCities = JSON.parse(
            localStorage.getItem("selectedCities")
          );
          if (tempSelectedCities.includes(d.properties.Communes)) return;
          tempSelectedCities.push(d.properties.Communes);
          localStorage.setItem(
            "selectedCities",
            JSON.stringify(tempSelectedCities)
          );
        } else {
          let tempArr = [];
          tempArr.push(d.properties.Communes);
          localStorage.setItem("selectedCities", JSON.stringify(tempArr));
        }
      } else {
        cityCount--;
        document.getElementById("city_count").innerHTML = cityCount;
        d3.select(this).attr("fill", MAP_COLOR);

        //remove from localStorage
        let tempSelectedCities = JSON.parse(
          localStorage.getItem("selectedCities")
        );
        const index = tempSelectedCities.indexOf(d.properties.Communes);
        if (index !== -1) {
          tempSelectedCities.splice(index, 1);
        }
        localStorage.setItem(
          "selectedCities",
          JSON.stringify(tempSelectedCities)
        );
      }
      d.noFill = !d.noFill;
    });

  console.log(data.features.map((f) => f.properties.Communes));

  g = svg.append("g");

  g.selectAll("text")
    .data(data.features)
    .enter()
    .append("text")
    .text(function (d) {
      return d.properties.Communes;
    })
    .attr("x", function (d) {
      return path.centroid(d)[0];
    })
    .attr("y", function (d) {
      return path.centroid(d)[1];
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "10pt")
    .attr("style", "color: black;")
    .attr("style", "pointer-events: none;");
});

function downloadMap() {
  let div = document.getElementById("map_container");
  html2canvas(div).then(function (canvas) {
    var destCanvas = document.createElement("canvas");
    destCanvas.width = canvas.width;
    destCanvas.height = canvas.height;
    var destCtx = destCanvas.getContext("2d");
    destCtx.drawImage(canvas, 0, 0);

    const ctx = destCanvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "2em Calibri";
    ctx.fillStyle = "black";
    ctx.textAlign = "start";
    var textWidth = ctx.measureText("gsn1511.github.io/belgiumvisited");
    ctx.fillText("gsn1511.github.io/belgiumvisited", 10, canvas.height - 25);
    ctx.fillText(cityCount + "/589", 10, 5);

    destCanvas.toBlob(function (blob) {
      saveAs(blob, "belgiumvisited.png");
    });
  });
}

function resetButton() {
  localStorage.removeItem("selectedCities")
  cityCount = 0; document.getElementById("city_count").innerHTML = cityCount;
  location.reload()
}
