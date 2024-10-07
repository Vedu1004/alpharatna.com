// src/components/Heatmap.js
import m from "mithril";
import Highcharts from "highcharts";
import HighchartsTreemap from "highcharts/modules/treemap";
import "../../public/css/Heatmap.css";

HighchartsTreemap(Highcharts);

const Heatmap = {
  oninit: function (vnode) {
    this.jsonArray = [];
    this.currentHeatmapType = "marketCap";
    this.categories = ["marketCap", "turnover", "range", "rangeTodayVsAvg"];
    this.chart = null;
  },

  oncreate: function (vnode) {
    this.initWebSocket();
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
        this.updateChart(formattedData, this.currentHeatmapType);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };
  },

  onremove: function (vnode) {
    if (this.socket) {
      this.socket.close();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  },

  formatDataForHeatmap: function (jsonArray, type) {
    return jsonArray.map((item) => {
      const symbol = item.ts.split("-")[0];
      const price = parseFloat(item.ap);
      const change = parseFloat(
        (
          ((parseFloat(item.lp) - parseFloat(item.o)) / parseFloat(item.o)) *
          100
        ).toFixed(2)
      );

      let value, colorValue;

      switch (type) {
        case "turnover":
          value = parseFloat(item.v) * parseFloat(item.lp);
          break;
        case "marketCap":
          value = parseFloat(item.os) * parseFloat(item.lp);
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
          value = parseFloat(item.v) * parseFloat(item.lp);
      }

      colorValue = change;

      return {
        name: `${symbol}|${price}|${change}%`,
        value: value,
        colorValue: colorValue,
      };
    });
  },

  getTenDayAverageRange: function (symbol) {
    return 2; // Placeholder value
  },

  updateChart: function (data, type) {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Invalid data format. Expected non-empty array.");
      return;
    }

    let colorAxisConfig = {
      stops: [
        [0, "rgb(246, 53, 56)"],
        [0.5, "rgb(65, 69, 84)"],
        [1, "rgb(48, 204, 90)"],
      ],
      min: -4,
      max: 4,
    };
    if (!this.chart) {
      this.chart = Highcharts.chart("container", {
        chart: {
          height: 600,
        },
        colorAxis: colorAxisConfig,
        series: [
          {
            type: "treemap",
            layoutAlgorithm: "squarified",
            data: data,
            dataLabels: {
              enabled: true,
              useHTML: true,
              formatter: function () {
                const point = this.point;
                const shapeArgs = point.shapeArgs || {};
                const width = shapeArgs.width || 0;
                const height = shapeArgs.height || 0;
                const minDimension = Math.min(width, height);
                const fontSize = Math.max(6, Math.min(14, minDimension / 8));
                const [symbol, price, change] = point.name.split("|");

                let content = "";
                if (minDimension >= 30) {
                  content = `
                    <div style="font-weight:bold;font-size:${
                      fontSize * 1.5
                    }px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;text-align:center;">${symbol}</div>
                    <div style="font-size:${
                      fontSize * 0.9
                    }px;text-align:center;">${change}</div>
                  `;
                }

                return `<div style="width:${width}px;height:${height}px;display:flex;flex-direction:column;justify-content:center;align-items:center;overflow:hidden;padding:2px;box-sizing:border-box;">
                    ${content}
                </div>`;
              },
              style: {
                color: "#ffffff",
                textOutline: "none",
              },
              padding: 0,
              allowOverlap: true,
            },
          },
        ],
        title: {
          text: `180 Stocks - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        },
        tooltip: {
          useHTML: true,
          formatter: function () {
            const [symbol, price, change] = this.point.name.split("|");
            const value = this.point.value;
            let tooltipContent = `<b>${symbol}</b><br/>Price: ${price}<br/>Change: ${change}<br/>`;

            switch (type) {
              case "turnover":
                tooltipContent += `Turnover: ${value.toFixed(2)}`;
                break;
              case "marketCap":
                tooltipContent += `Market Cap: ${value.toFixed(2)}`;
                break;
              case "range":
                tooltipContent += `Range: ${value.toFixed(2)}%`;
                break;
              case "rangeTodayVsAvg":
                tooltipContent += `Range Today vs 10-day Avg: ${value.toFixed(
                  2
                )}`;
                break;
              default:
                tooltipContent += `Value: ${value.toFixed(2)}`;
            }

            return tooltipContent;
          },
        },
      });
    } else {
      // Update existing chart
      this.chart.series[0].setData(data, true);
      this.chart.setTitle({
        text: `180 Stocks - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      });
    }
  },

  view: function (vnode) {
    return m("div.heatmap-container", { display: "flex", marginTop: "7vh" }, [
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
        m("div", { id: "container", style: "height: 600px;" }),
      ]),
    ]);
  },

  changeHeatmapType: function (type) {
    this.currentHeatmapType = type;
    let formattedData = this.formatDataForHeatmap(
      this.jsonArray[0].scrip_datas,
      this.currentHeatmapType
    );
    this.updateChart(formattedData, this.currentHeatmapType);
  },
};

export default Heatmap;
