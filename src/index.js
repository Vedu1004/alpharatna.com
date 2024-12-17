// src/index.js
import m from "mithril";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Heatmap from "./components/Heatmap";
import StockList from "./components/Feed";
import Drawdown from "./components/Drawdown";
import StockDetail from "./components/Stockdetail";
import HeatmapD3 from "./components/HeatmapD3";
import HeatmapHighcharts from "./components/HeatmapDynamic";
import HomePage from "./components/Home";

const Layout = {
  view: function (vnode) {
    return m("div.layout", [m(Header), m("main", vnode.children), m(Footer)]);
  },
};
m.route.mode = "pathname"; // Add this lin
m.route.prefix = "";
m.route(document.body, "/", {
  "/": {
    render: function () {
      return m(Layout, m(HomePage));
    },
  },
  "/heatmap": {
    render: function () {
      return m(Layout, m(Heatmap));
    },
  },
  "/stocks": {
    render: function () {
      return m(Layout, m(StockList));
    },
  },
  "/drawdown": {
    render: function () {
      return m(Layout, m(Drawdown));
    },
  },
  "/stocks/:symbol": {
    render: function () {
      return m(Layout, m(StockDetail));
    },
  },
});
