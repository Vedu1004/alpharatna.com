import m from "mithril";
import "../../public/css/feed.css";
import Sidebar from "./sidebar";
import store from "../store/store";

const Drawdown = {
  oninit: function (vnode) {
    this.socket = null;
    this.performanceData = [];
    this.itemsPerPage = 50; // Changed from visibleItems to itemsPerPage
    this.currentPage = 1; // Add current page tracking
    this.totalItems = 0;
    this.sortColumn = null;
    this.sortDirection = 1;
    this.performanceType = "30d";
    this.typeLabels = {
      "30d": "Monthly",
      "60d": "60 days",
      "7d": "Weekly",
      "365d": "yearly",
      "90d": "Quaterly",
      "15d": "15 days",
      "180d": "180 days",
    };
    this.searchQuery = "";
    this.filteredData = [];
    this.selectedPercentage = 10;
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
    this.socket = new WebSocket("ws://localhost:7070/ws");

    this.socket.onopen = () => {
      console.log("WebSocket connection established");
      this.requestPerformanceData();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      m.redraw();
    };

    this.socket.onmessage = (event) => {
      try {
        let jsonData = JSON.parse(event.data);
        console.log(jsonData);
        if (jsonData) {
          this.performanceData = jsonData;
          // Update filtered data when new data arrives
          this.updateFilteredData();
          this.totalItems = this.filteredData.length;
          m.redraw();
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  },

  // New method to handle search
  handleSearch: function (value) {
    this.searchQuery = value;
    this.updateFilteredData();
  },

  // New method to update filtered data
  updateFilteredData: function () {
    const query = this.searchQuery.toLowerCase().trim();
    let filtered = this.performanceData;

    // First apply search filter
    if (query) {
      filtered = filtered.filter((item) =>
        item.symbol.toLowerCase().includes(query)
      );
    }

    // Then apply percentage filter
    filtered = filtered.filter(
      (item) => Math.abs(item.drawdown) >= this.selectedPercentage
    );

    this.filteredData = filtered;
    this.totalItems = this.filteredData.length;
    this.currentPage = 1; // Reset to first page when filter changes
  },

  setPercentageFilter: function (percentage) {
    this.selectedPercentage = percentage;
    this.updateFilteredData();
    this.sortBy("drawdown", true);
  },

  requestPerformanceData: function () {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(`drawdown ${this.performanceType}`);
    }
  },

  updatePerformanceType: function (type) {
    console.log(type);
    if (
      ["30d", "7d", "365d", "15d", "60d", "90d", "180d"].includes(type) &&
      type !== this.performanceType
    ) {
      this.performanceType = type;
      this.performanceData = []; // Clear existing data
      this.filteredData = []; // Clear filtered data
      this.visibleItems = 50; // Reset pagination
      this.totalItems = 0;
      this.sortColumn = null; // Reset sorting
      this.sortDirection = 1;
      this.searchQuery = ""; // Reset search
      this.requestPerformanceData();
    }
  },

  // Modify showMore to handle pagination
  getTotalPages() {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  },

  setPage(pageNumber) {
    if (pageNumber >= 1 && pageNumber <= this.getTotalPages()) {
      this.currentPage = pageNumber;
      m.redraw();
    }
  },

  // Helper method to get page numbers to display
  getPageNumbers() {
    const totalPages = this.getTotalPages();
    const current = this.currentPage;
    const pages = [];

    if (totalPages <= 7) {
      // If total pages is 7 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Add pages around current page
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(current + 1, totalPages - 1);
        i++
      ) {
        pages.push(i);
      }

      if (current < totalPages - 2) {
        pages.push("...");
      }

      // Always include last page
      pages.push(totalPages);
    }

    return pages;
  },

  formatNumber: function (num) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(num);
  },

  formatDate: function (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  },

  sortBy: function (column, type = null) {
    if (type || this.sortColumn !== column) {
      this.sortColumn = column;
      this.sortDirection = 1;
    } else {
      this.sortDirection *= -1;
    }

    // Modified to sort filteredData instead of performanceData
    this.filteredData.sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (["drawdown", "all_time_drawdown", "Recovery"].includes(column)) {
        console.log(column);
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
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const currentPageData = this.filteredData.slice(startIndex, endIndex);
    return m("div.drawdown-list-container", [
      isSidebar &&
        m(Sidebar, {
          onTypeChange: (type) => this.updatePerformanceType(type),
          currentType: this.performanceType,
        }),
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
                "display: flex; justify-content: space-between; align-items: center;",
            },
            [m("h1", `${this.typeLabels[this.performanceType]} Performance`)]
          ),
          m(
            "p",
            `This table shows the ${this.typeLabels[
              this.performanceType
            ].toLowerCase()} performance data for various financial instruments.`
          ),
          m("div.percentage-filters", [
            [5, 10, 15, 20].map((percent) =>
              m(
                "button.percent-btn",
                {
                  className:
                    this.selectedPercentage === percent ? "active" : "",
                  onclick: () => this.setPercentageFilter(percent),
                },
                `${percent}%`
              )
            ),
            m("input.search-input", {
              type: "text",
              placeholder: "Search symbols...",
              value: this.searchQuery,
              oninput: (e) => this.handleSearch(e.target.value),
              style: `
            padding: 0.5rem 1rem;
            border: 1px solid #ccc;
            margin-right:1vw;
            border-radius: 4px;
            width: 15vw;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
            margin-left:auto;
          `,
            }),
          ]),
          m("div.table-container", [
            m("table.styled-table", [
              m("thead", [
                m("tr", [
                  m("th", "Symbol"),

                  m(
                    "th",
                    { onclick: () => this.sortBy("drawdown") },
                    "Drawdown ",
                    m(
                      "span.sort-icon",
                      this.sortColumn === "drawdown"
                        ? this.sortDirection === 1
                          ? "▲"
                          : "▼"
                        : ""
                    )
                  ),
                  m("th", "Drawdown period"),
                  m(
                    "th",
                    { onclick: () => this.sortBy("all_time_drawdown") },
                    "MAX Drawdown(2y)",
                    m(
                      "span.sort-icon",
                      this.sortColumn === "all_time_drawdown"
                        ? this.sortDirection === 1
                          ? "▲"
                          : "▼"
                        : ""
                    )
                  ),
                  m("th", "MAX Drawdown period"),
                  m("th", "Recovery"),
                ]),
              ]),
              m(
                "tbody",
                // Modified to use filteredData instead of performanceData
                currentPageData.map((item) =>
                  m("tr", [
                    m(
                      "td",
                      {
                        ondblclick: () => m.route.set(`/stocks/${item.symbol}`),
                        style: "cursor: pointer",
                      },
                      item.symbol
                    ),
                    m(
                      "td",
                      `${parseFloat(this.formatNumber(item.drawdown)).toFixed(
                        1
                      )}%`
                    ),
                    m(
                      "td",
                      `${this.formatDate(item.drd_start)} - ${this.formatDate(
                        item.drd_end
                      )}`
                    ),

                    m(
                      "td",
                      `${parseFloat(
                        this.formatNumber(item.all_time_drawdown)
                      ).toFixed(1)}%`
                    ),
                    m(
                      "td",
                      `${this.formatDate(item.mdrd_start)} - ${this.formatDate(
                        item.mdrd_end
                      )}`
                    ),
                    m(
                      "td",
                      `${parseFloat(
                        this.formatNumber(
                          (1 / (1 - item.drawdown / 100) - 1) * 100
                        )
                      ).toFixed(1)}%`
                    ),
                  ])
                )
              ),
            ]),
            m(
              "div.settings-panel",
              {
                style: `
                top: 0;
                right: 0;
                width: 20%;
                background-color: white;
                border-left: 1px solid #e5e7eb;
                padding: 1rem;
              `,
              },
              [
                m("img", {
                  src: "/images/settings.png",
                  alt: "Settings",
                  style: `
                  width: 24px;
                  height: 24px;
                  cursor: pointer;
                `,
                }),
              ]
            ),
          ]),
          m("div.pagination", [
            // Previous button
            m(
              "button.page-btn",
              {
                onclick: () => this.setPage(this.currentPage - 1),
                disabled: this.currentPage === 1,
                className: this.currentPage === 1 ? "disabled" : "",
              },
              "←"
            ),

            // Page numbers
            this.getPageNumbers().map((pageNum) =>
              m(
                "button.page-btn",
                {
                  key: pageNum,
                  onclick:
                    pageNum === "..." ? null : () => this.setPage(pageNum),
                  className: `${pageNum === this.currentPage ? "active" : ""} ${
                    pageNum === "..." ? "ellipsis" : ""
                  }`,
                },
                pageNum
              )
            ),

            // Next button
            m(
              "button.page-btn",
              {
                onclick: () => this.setPage(this.currentPage + 1),
                disabled: this.currentPage === this.getTotalPages(),
                className:
                  this.currentPage === this.getTotalPages() ? "disabled" : "",
              },
              "→"
            ),
          ]),
        ]
      ),
    ]);
  },
};

export default Drawdown;
