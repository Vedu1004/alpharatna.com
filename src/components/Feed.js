import m from "mithril";
import "../../public/css/feed.css";
import Sidebar from "./sidebar";
import store from "../store/store";
const StockList = {
  oninit: function (vnode) {
    this.socket = null;
    this.jsonArray = [];
    this.visibleStocks = 20;
    this.totalStocks = 0;
    this.searchQuery = "";
    this.filteredStocks = [];
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
        this.jsonArray = this.jsonArray[0].scrip_datas;
        this.updateFilteredStocks();
        this.totalStocks = this.filteredStocks.length;
        m.redraw();
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  },

  updateFilteredStocks: function () {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredStocks = query
      ? this.jsonArray.filter((stock) =>
          stock.ts.toLowerCase().split("-")[0].includes(query)
        )
      : this.jsonArray;
    this.totalStocks = this.filteredStocks.length;
    this.visibleStocks = Math.min(20, this.totalStocks);
  },

  handleSearch: function (value) {
    this.searchQuery = value;
    this.updateFilteredStocks();
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

    this.filteredStocks.sort((a, b) => {
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
  collaps: function () {
    store.toggleSidebar(); // Use store method instead of local state
  },
  view: function (vnode) {
    const isSidebar = store.getSidebarState();
    return m("div.stock-list-container", [
      isSidebar && m(Sidebar),
      m(
        "div.drawdown-table",
        {
          style: isSidebar
            ? "flex-grow: 1; margin-left: 22vw;"
            : "flex-grow: 1; margin-left: 2vw;",
        },
        [
          m(
            "button.ham",
            {
              onclick: () => this.collaps(),
            },
            m("img.dashboard-logo", {
              src: "/images/menu.png",
              alt: "Ratna Logo",
            })
          ),
          m(
            "div.header-container",
            {
              style:
                "display: flex; justify-content: space-between; align-items: center; ",
            },
            [
              m("h1", "List of Stocks"),
              m("input.search-input", {
                type: "text",
                placeholder: "Search stocks...",
                value: this.searchQuery,
                oninput: (e) => this.handleSearch(e.target.value),
                style: `
              padding: 0.5rem 1rem;
              border: 1px solid #ccc;
              border-radius: 4px;
              width: 200px;
              font-size: 1rem;
              margin-right:5vw;
              outline: none;
              transition: border-color 0.2s;
            `,
              }),
            ]
          ),
          m(
            "p",
            "With over 5,000 stocks listed on stock exchanges, tracking each one can be overwhelming. That's why we've created a comprehensive list of stocks to help you easily monitor their performance all in one place. Here is the complete list of stocks listed on the stock market:"
          ),
          m("div.table-container", [
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
                    {
                      onclick: () => this.sortBy("lp"),
                      title: "Last traded price",
                    },
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
                    {
                      onclick: () => this.sortBy("pc"),
                      title: "percent change",
                    },
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
                    {
                      onclick: () => this.sortBy("os"),
                      title: "Stock market capitalization",
                    },
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
                  m(
                    "th",
                    {
                      title: "1 day higest/lowest price",
                    },
                    "High / Low (₹)"
                  ),
                  m(
                    "th",
                    {
                      onclick: () => this.sortBy("v"),
                      title: "Volume traded",
                    },
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
                this.filteredStocks.slice(0, this.visibleStocks).map((stock) =>
                  m("tr", [
                    m(
                      "td",
                      {
                        ondblclick: () =>
                          m.route.set(`/stocks/${stock.ts.split("-")[0]}`),
                        style: "cursor: pointer",
                      },
                      stock.ts.split("-")[0]
                    ),
                    m("td", this.formatNumber(parseFloat(stock.lp).toFixed(2))),
                    m(
                      "td",
                      {
                        class:
                          parseFloat(stock.pc) >= 0 ? "positive" : "negative",
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
          ]),
          m("div.btm", [
            this.visibleStocks < this.totalStocks &&
              m(
                "div.show-more",
                {
                  onclick: () => this.showMore(),
                },
                "Show More"
              ),
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
        ]
      ),
    ]);
  },
};

export default StockList;
