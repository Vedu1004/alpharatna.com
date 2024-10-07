import m from "mithril";
import "../../public/css/header.css";

const Header = {
  view: function () {
    return m("header.fixed-header", [
      m("div.logo", [
        m("img", { src: "/images/ratna.png", alt: "Ratna Logo" }),
        m("span", "𝖗𝖆𝖙𝖓𝖆"),
      ]),
      m("nav", [
        m(m.route.Link, { href: "/" }, "HOME"),
        m(m.route.Link, { href: "/heatmap" }, "HEATMAP"),
        m(m.route.Link, { href: "/feed" }, "FEED"),
        m(m.route.Link, { href: "/" }, "NEWS"),
        m(m.route.Link, { href: "/" }, "MORE"),
      ]),
      m("div.search", [
        m("input[type=text][placeholder=Search for a company]"),
      ]),
    ]);
  },
};

export default Header;
