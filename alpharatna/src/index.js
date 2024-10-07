// src/index.js
import m from "mithril";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Heatmap from "./components/Heatmap";
import StockList from "./components/Feed";
import HeatmapD3 from "./components/HeatmapD3";
import HeatmapHighcharts from "./components/HeatmapDynamic";
import HomePage from "./components/Home";

const Layout = {
  view: function (vnode) {
    return m("div.layout", [m(Header), m("main", vnode.children), m(Footer)]);
  },
};

const Home = {
  view: function () {
    return m("div.content", "Welcome to Screener");
  },
};

m.route(document.body, "/", {
  "/": {
    render: function () {
      return m(Layout, m(HomePage));
    },
  },
  "/heatmap": {
    render: function () {
      return m(Layout, m(HeatmapHighcharts));
    },
  },
  "/feed": {
    render: function () {
      return m(Layout, m(StockList));
    },
  },
});
