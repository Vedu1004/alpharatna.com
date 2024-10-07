import m from "mithril";
import * as d3 from "d3";
import "../../public/css/Heatmap.css";

const HeatmapD3 = {
  oninit: function (vnode) {
    this.jsonArray = [];
    this.currentHeatmapType = "marketCap";
    this.categories = ["marketCap", "turnover", "range", "rangeTodayVsAvg"];
  },

  oncreate: function (vnode) {
    this.initWebSocket();
    this.createHeatmap();
  },

  onremove: function (vnode) {
    if (this.socket) {
      this.socket.close();
    }
  },

  initWebSocket: function () {
    this.socket = new WebSocket("ws://localhost:8080/ws");

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.socket.send("send_latest_scrips_data");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      m.redraw();
    };

    this.socket.onmessage = (event) => {
      try {
        let jsonData = event.data;
        let jsonStrings = jsonData.split("\n");
        this.jsonArray = [];
        jsonStrings.forEach((jsonString) => {
          if (jsonString.trim()) {
            try {
              let jsonObject = JSON.parse(jsonString);
              this.jsonArray.push(jsonObject);
            } catch (err) {
              console.error("Error parsing JSON:", err);
            }
          }
        });
        console.log(this.jsonArray);
        let formattedData = this.formatDataForHeatmap(
          this.jsonArray,
          this.currentHeatmapType
        );
        console.log(formattedData);
        this.updateHeatmap(formattedData);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };
  },

  formatDataForHeatmap: function (jsonArray, type) {
    return jsonArray.map((item) => {
      const symbol = item.ts.split("-")[0];
      const price = parseFloat(item.lp);
      const change = parseFloat(
        (
          ((parseFloat(item.lp) - parseFloat(item.o)) / parseFloat(item.o)) *
          100
        ).toFixed(2)
      );

      let value;
      switch (type) {
        case "turnover":
          value = parseFloat(item.v) * price;
          break;
        case "marketCap":
          value = parseFloat(item.os) * price;
          break;
        case "range":
          value =
            ((parseFloat(item.h) - parseFloat(item.l)) / parseFloat(item.l)) *
            100;
          break;
        case "rangeTodayVsAvg":
          const todayRange =
            ((parseFloat(item.h) - parseFloat(item.l)) / parseFloat(item.l)) *
            100;
          const avgRange = this.getTenDayAverageRange(symbol); // You need to implement this
          value = todayRange / avgRange;
          break;
        default:
          value = parseFloat(item.v) * price;
      }

      return {
        name: symbol,
        value: value,
        change: change,
        price: price,
      };
    });
  },

  getTenDayAverageRange: function (symbol) {
    // Implement this function to get the 10-day average range
    return 2; // Placeholder
  },

  createHeatmap: function () {
    const width = 1200;
    const height = 500;

    this.svg = d3
      .select("#heatmap")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    this.treemap = d3.treemap().size([width, height]).padding(1);

    this.colorScale = d3
      .scaleLinear()
      .domain([-4, 0, 4])
      .range(["rgb(246, 53, 56)", "rgb(65, 69, 84)", "rgb(48, 204, 90)"]);
  },

  updateHeatmap: function (data) {
    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    this.treemap(root);

    const cells = this.svg
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cells
      .selectAll("rect")
      .data((d) => [d])
      .join("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => this.colorScale(d.data.change));

    cells
      .selectAll("text")
      .data((d) => [d])
      .join("text")
      .attr("x", 3)
      .attr("y", 13)
      .text((d) => `${d.data.name}\n${d.data.price}\n${d.data.change}%`)
      .attr("font-size", "10px")
      .attr("fill", "white");

    m.redraw();
  },

  changeHeatmapType: function (type) {
    this.currentHeatmapType = type;
    let formattedData = this.formatDataForHeatmap(
      this.jsonArray,
      this.currentHeatmapType
    );
    this.updateHeatmap(formattedData);
  },

  view: function (vnode) {
    return m("div.heatmap-container", { style: "display: flex;" }, [
      m(
        "div.sidebar",
        { style: "width: 200px; padding: 20px; background-color: #f0f0f0;" },
        [
          m("h3", "MAP FILTER"),
          m("ul", [
            m("li", "S&P 500"),
            m("li", "World"),
            m("li", "Full"),
            m("li", "Exchange Traded Funds"),
          ]),
          m(
            "select",
            {
              onchange: (e) => this.changeHeatmapType(e.target.value),
              style: "width: 100%; margin-top: 20px;",
            },
            this.categories.map((category) =>
              m(
                "option",
                { value: category },
                category.charAt(0).toUpperCase() + category.slice(1)
              )
            )
          ),
          m("input", {
            type: "text",
            placeholder: "Quick search ticker",
            style: "width: 100%; margin-top: 20px;",
          }),
        ]
      ),
      m("div.heatmap", { style: "flex-grow: 1;" }, [
        m(
          "h3",
          `180 Stocks - ${
            this.currentHeatmapType.charAt(0).toUpperCase() +
            this.currentHeatmapType.slice(1)
          }`
        ),
        m("div#heatmap"),
      ]),
    ]);
  },
};

export default HeatmapD3;
