import m from "mithril";
import Highcharts from "highcharts";
import "../../public/css/Stockdetail.css";
const StockDetail = {
  oninit: function (vnode) {
    this.socket = null;
    this.stockData = [];
    this.symbol = m.route.param("symbol"); // Get symbol from route parameter
    this.chartInstance = null;
  },

  oncreate: function (vnode) {
    this.initWebSocket();
  },

  onremove: function (vnode) {
    if (this.socket) {
      this.socket.close();
    }
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },

  initWebSocket: function () {
    this.socket = new WebSocket("ws://localhost:7070/ws");

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.socket.send(this.symbol); // Send the symbol name
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      m.redraw();
    };

    this.socket.onmessage = (event) => {
      try {
        this.stockData = JSON.parse(event.data);
        this.initChart();
        m.redraw();
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  },

  initChart: function () {
    // Transform data for Highcharts
    const seriesData = this.stockData.map((item) => [
      new Date(item.timestamp).getTime(),
      item.close,
    ]);

    // Get min and max values for y-axis padding
    const prices = this.stockData.map((item) => item.close);
    const minPrice = Math.min(...prices) * 0.95; // 5% padding
    const maxPrice = Math.max(...prices) * 1.05;

    const config = {
      chart: {
        type: "line",
        style: {
          fontFamily: "Arial, sans-serif",
        },
        height: 500,
      },
      title: {
        text: `${this.symbol} Stock Price History`,
        style: {
          fontSize: "20px",
        },
      },
      xAxis: {
        type: "datetime",
        labels: {
          format: "{value:%Y-%m-%d}",
          style: {
            fontSize: "12px",
          },
        },
        gridLineWidth: 1,
        gridLineColor: "#f2f2f2",
      },
      yAxis: {
        title: {
          text: "Price (₹)",
        },
        min: minPrice,
        max: maxPrice,
        labels: {
          format: "{value:.2f}",
          style: {
            fontSize: "12px",
          },
        },
        gridLineColor: "#f2f2f2",
      },
      series: [
        {
          name: this.symbol,
          data: seriesData,
          color: "#34A853",
          lineWidth: 2,
          marker: {
            enabled: true,
            radius: 2,
            symbol: "circle",
          },
        },
      ],
      tooltip: {
        formatter: function () {
          return `<b>${this.series.name}</b><br/>
                    Date: ${Highcharts.dateFormat("%Y-%m-%d", this.x)}<br/>
                    Price: ₹${this.y.toFixed(2)}`;
        },
      },
      plotOptions: {
        series: {
          animation: {
            duration: 1000,
          },
        },
      },
    };

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = Highcharts.chart("chart-container", config);
  },

  formatNumber: function (num) {
    return new Intl.NumberFormat("en-IN").format(num);
  },

  view: function (vnode) {
    const latestData = this.stockData[this.stockData.length - 1] || {};

    return m("div.stock-detail", [
      m("div.stock-header", [
        m("h1", this.symbol),
        m("div.stock-info", [
          m("div.price-info", [
            m(
              "span.current-price",
              `₹${this.formatNumber(latestData.close || 0)}`
            ),
            m(
              "span.change-percent",
              {
                class:
                  latestData.close > latestData.prevClose
                    ? "positive"
                    : "negative",
              },
              `${(
                ((latestData.close - latestData.prevClose) /
                  latestData.prevClose) *
                100
              ).toFixed(2)}%`
            ),
          ]),
          m("div.trading-info", [
            m("span", `High: ₹${this.formatNumber(latestData.high || 0)}`),
            m("span", `Low: ₹${this.formatNumber(latestData.low || 0)}`),
            m(
              "span",
              `Volume: ${this.formatNumber(latestData.totTrdQty || 0)}`
            ),
          ]),
        ]),
      ]),
      m("div#chart-container", { style: "width: 97vw; height: 80vh;" }),
      m("div.trading-details", [
        m("h3", "Trading Details"),
        m("div.details-grid", [
          m("div.detail-item", [
            m("span.label", "Open"),
            m("span.value", `₹${this.formatNumber(latestData.open || 0)}`),
          ]),
          m("div.detail-item", [
            m("span.label", "Previous Close"),
            m("span.value", `₹${this.formatNumber(latestData.prevClose || 0)}`),
          ]),
          m("div.detail-item", [
            m("span.label", "Total Trades"),
            m("span.value", this.formatNumber(latestData.totalTrades || 0)),
          ]),
          m("div.detail-item", [
            m("span.label", "Total Value"),
            m("span.value", `₹${this.formatNumber(latestData.totTrdVal || 0)}`),
          ]),
        ]),
      ]),
    ]);
  },
};

export default StockDetail;
