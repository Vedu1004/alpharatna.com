import m from "mithril";
import "../../public/css/feed.css";

const StockList = {
  oninit: function (vnode) {
    this.socket = null;
    this.jsonArray = [];
    this.visibleStocks = 20;
    this.totalStocks = 0;
  },

  oncreate: function (vnode) {
    this.initWebSocket();
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
        this.totalStocks = this.jsonArray.length;
        m.redraw();
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  },

  formatNumber: function (num) {
    return new Intl.NumberFormat("en-IN").format(num);
  },

  showMore: function () {
    this.visibleStocks += 20;
    if (this.visibleStocks > this.totalStocks) {
      this.visibleStocks = this.totalStocks;
    }
  },
  sortBy: function (column) {
    if (this.sortColumn === column) {
      this.sortDirection *= -1;
    } else {
      this.sortColumn = column;
      this.sortDirection = 1;
    }

    this.jsonArray.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (column === "ts") {
        valueA = valueA.split("-")[0];
        valueB = valueB.split("-")[0];
      } else if (["lp", "pc", "os", "v"].includes(column)) {
        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);
      }

      if (valueA < valueB) return -1 * this.sortDirection;
      if (valueA > valueB) return 1 * this.sortDirection;
      return 0;
    });
  },

  view: function (vnode) {
    return m("div.stock-list-container", [
      m("div.sidebar", [
        m("h1", "Stocks"),
        m("ul", [
          m("li", "All Stocks"),
          m("li", "Market Data"),
          m("li", "Sectors"),
          m("li", "Indices"),
        ]),
      ]),
      m("div.stock-table", [
        m("h1", "List of Stocks"),
        m(
          "p",
          "With over 5,000 stocks listed on stock exchanges, tracking each one can be overwhelming. That's why we've created a comprehensive list of stocks to help you easily monitor their performance all in one place. Here is the complete list of stocks listed on the stock market:"
        ),
        m("table.styled-table", [
          m("thead", [
            m("tr", [
              m(
                "th",
                "Company",
                m(
                  "span.sort-icon",
                  this.sortColumn === "ts"
                    ? this.sortDirection === 1
                      ? "▲"
                      : "▼"
                    : ""
                )
              ),
              m(
                "th",
                { onclick: () => this.sortBy("lp") },
                "LTP (₹)",
                m(
                  "span.sort-icon",
                  this.sortColumn === "lp"
                    ? this.sortDirection === 1
                      ? "▲"
                      : "▼"
                    : ""
                )
              ),
              m(
                "th",
                { onclick: () => this.sortBy("pc") },
                "1D Return %",
                m(
                  "span.sort-icon",
                  this.sortColumn === "pc"
                    ? this.sortDirection === 1
                      ? "▲"
                      : "▼"
                    : ""
                )
              ),
              m(
                "th",
                { onclick: () => this.sortBy("os") },
                "Market Cap ",
                m(
                  "span.sort-icon",
                  this.sortColumn === "os"
                    ? this.sortDirection === 1
                      ? "▲"
                      : "▼"
                    : ""
                )
              ),
              m("th", "High / Low (₹)"),
              m(
                "th",
                { onclick: () => this.sortBy("v") },
                "Volume",
                m(
                  "span.sort-icon",
                  this.sortColumn === "v"
                    ? this.sortDirection === 1
                      ? "▲"
                      : "▼"
                    : ""
                )
              ),
            ]),
          ]),
          m(
            "tbody",
            this.jsonArray.slice(0, this.visibleStocks).map((stock) =>
              m("tr", [
                m("td", stock.ts.split("-")[0]),
                m("td", this.formatNumber(parseFloat(stock.lp).toFixed(2))),
                m(
                  "td",
                  {
                    class: parseFloat(stock.pc) >= 0 ? "positive" : "negative",
                  },
                  `${parseFloat(stock.pc).toFixed(2)}%`
                ),
                m(
                  "td",
                  this.formatNumber(
                    Math.round(parseFloat(stock.lp) * parseFloat(stock.os))
                  )
                ),
                m("td", `${stock.h}/${stock.l}`),
                m("td", this.formatNumber(stock.v)),
              ])
            )
          ),
        ]),
        m("div.btm", [
          this.visibleStocks < this.totalStocks &&
            m("div.show-more", { onclick: () => this.showMore() }, "Show More"),
          m(
            "p.stock-count",
            `Showing ${this.visibleStocks} of ${
              this.totalStocks
            } stocks. Last Updated: ${new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}`
          ),
        ]),
      ]),
    ]);
  },
};

export default StockList;
