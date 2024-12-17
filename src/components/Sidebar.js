import m from "mithril";
import "../../public/css/sidebar.css";
const Sidebar = {
  oninit: function (vnode) {
    this.isStocklistOpen = false;
    this.isHeatmapOpen = false;
    this.isDrawOpen = false;
    this.currentHeatmapType = vnode.attrs.currentHeatmapType;
    this.currentDrawdownType = vnode.attrs.currentType || "30d"; // Default to Yearly
    this.Heatmapcategories = [
      "marketCap",
      "turnover",
      "range",
      "rangeTodayVsAvg",
    ];
    this.stockCategories = ["S&P 500", "Standard 180", "Nifty 50"];
    this.drawdowncat = [
      { label: "Yearly", value: "365d" },
      { label: "Monthly", value: "30d" },
      { label: "Weekly", value: "7d" },
      { label: "Quaterly", value: "90d" },
      { label: "60 days", value: "60d" },
      { label: "180 days", value: "180d" },
      { label: "15 days", value: "15d" },
    ];
  },

  view: function (vnode) {
    return m("div.sidebars", [
      m("div.dashboard-header", [m("h2.dashboard-title", "My Dashboard")]),

      m("nav.navigation", [
        this.renderDropdown(
          "Stock data",
          this.stockCategories,
          "isStocklistOpen"
        ),
        this.renderDropdown(
          "Heatmap",
          this.Heatmapcategories,
          "isHeatmapOpen",
          vnode.attrs.onHeatmapTypeChange,
          "heatmap"
        ),
        this.renderDropdown(
          "Drawdown Performance",
          this.drawdowncat,
          "isDrawOpen",
          vnode.attrs.onTypeChange,
          "drawdown"
        ),

        // Regular nav items
        [
          "Open Interest",
          "Volume",
          "Market Cap",
          "Options",
          "OrderBook",
          "Grayscale",
          "Funding Rate",
        ].map((item) =>
          m("div.nav-item", [
            m("div.nav-item-content", [
              m("span.nav-item-icon", "▶"),
              m("span", item),
            ]),
          ])
        ),
      ]),
    ]);
  },

  renderDropdown: function (title, items, openState, onItemClick, type) {
    return m("div.nav-item", [
      m(
        "div.dropdown-header",
        {
          class: this[openState] ? "dropdown-header--active" : "",
          onclick: () => (this[openState] = !this[openState]),
        },
        [m("span.nav-item-icon", this[openState] ? "▼" : "▶"), m("span", title)]
      ),
      this[openState] &&
        m(
          "div.dropdown-content",
          items.map((item) => {
            const itemValue =
              type === "drawdown" ? item.value : item.toLowerCase();
            const itemLabel =
              type === "drawdown"
                ? item.label
                : item.charAt(0).toUpperCase() + item.slice(1);
            const isSelected =
              type === "drawdown"
                ? this.currentDrawdownType === itemValue
                : this.currentHeatmapType === itemValue;

            return m(
              "div.dropdown-item",
              {
                class: isSelected ? "dropdown-item--selected" : "",
                onclick: () => {
                  if (onItemClick) {
                    if (type === "drawdown") {
                      this.currentDrawdownType = itemValue;
                      onItemClick(itemValue);
                    } else {
                      onItemClick(itemValue);
                    }
                  }
                },
              },
              itemLabel
            );
          })
        ),
    ]);
  },
};

export default Sidebar;
