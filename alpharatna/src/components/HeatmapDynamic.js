import m from "mithril";
import Highcharts from "highcharts";
import highchartsHeatmap from "highcharts/modules/heatmap";
import highchartsTreemap from "highcharts/modules/treemap";
import "../../public/css/Heatmap.css";

// Initialize Highcharts modules
highchartsHeatmap(Highcharts);
highchartsTreemap(Highcharts);

const HeatmapHighcharts = {
  oninit: function (vnode) {
    this.jsonArray = [];
    this.currentHeatmapType = "marketCap";
    this.categories = ["marketCap", "turnover", "range", "rangeTodayVsAvg"];
    this.chart = null;
  },

  oncreate: function (vnode) {
    this.initWebSocket();
    this.createHeatmap();
  },

  onremove: function (vnode) {
    if (this.socket) {
      this.socket.close();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  },

  initWebSocket: function () {
    this.socket = new WebSocket("ws://alpharatna.com:8080/ws");

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
          this.jsonArray[0].scrip_datas,
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
          ((parseFloat(item.lp) - parseFloat(item.c)) / parseFloat(item.c)) *
          100
        ).toFixed(2)
      );

      let value;
      switch (type) {
        case "marketCap":
          value = parseFloat(item.os) * price;
          break;
        case "turnover":
          value = parseFloat(item.v) * price;
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
          const avgRange = this.getTenDayAverageRange(symbol);
          value = todayRange / avgRange;
          break;
        default:
          value = parseFloat(item.v) * price;
      }

      return {
        id: symbol,
        name: symbol,
        value: value,
        colorValue: change,
      };
    });
  },

  getTenDayAverageRange: function (symbol) {
    // Implement this function to get the 10-day average range
    return 2; // Placeholder
  },

  createHeatmap: function () {
    this.chart = Highcharts.chart("heatmap", {
      series: [
        {
          type: "treemap",
          layoutAlgorithm: "squarified",
          data: [],
        },
      ],
      title: {
        text: "180 Stocks - " + this.currentHeatmapType,
      },
      colorAxis: {
        min: -4,
        max: 4,
        stops: [
          [0, "rgb(246, 53, 56)"],
          [0.5, "rgb(65, 69, 84)"],
          [1, "rgb(48, 204, 90)"],
        ],
      },
      tooltip: {
        pointFormat:
          "<b>{point.name}</b><br>Value: {point.value}<br>Change: {point.colorValue:.2f}%",
      },
    });
  },

  updateHeatmap: function (data) {
    if (this.chart) {
      this.chart.series[0].setData(data);
      this.chart.setTitle({
        text: `180 Stocks - ${
          this.currentHeatmapType.charAt(0).toUpperCase() +
          this.currentHeatmapType.slice(1)
        }`,
      });
    }
  },

  changeHeatmapType: function (type) {
    this.currentHeatmapType = type;
    let formattedData = this.formatDataForHeatmap(
      this.jsonArray[0].scrip_datas,
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
        m("div#heatmap", { style: "width: 80vw; height: 90vh;" }),
      ]),
    ]);
  },
};

export default HeatmapHighcharts;
