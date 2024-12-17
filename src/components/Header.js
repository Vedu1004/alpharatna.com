import m from "mithril";
import "../../public/css/header.css";

const Header = {
  oninit: function (vnode) {
    vnode.state.isMenuOpen = false;
  },
  closeMenu: function (vnode) {
    vnode.state.isMenuOpen = false;
  },
  view: function (vnode) {
    return m("header.fixed-header", [
      m(
        "button.hamburger",
        {
          onclick: () => (vnode.state.isMenuOpen = !vnode.state.isMenuOpen),
        },
        "☰"
      ),
      m("div.logo", [
        m("img", { src: "/images/ratna.png", alt: "Ratna Logo" }),
        m("span", "𝖗𝖆𝖙𝖓𝖆"),
      ]),
      m("nav", { class: vnode.state.isMenuOpen ? "open" : "" }, [
        m(
          m.route.Link,
          {
            href: "/",
            onclick: () => this.closeMenu(vnode),
            title: "Go to the home page",
          },
          "HOME"
        ),
        m(
          m.route.Link,
          {
            href: "/heatmap",
            onclick: () => this.closeMenu(vnode),
            title: "Generate heatmap",
          },
          "HEATMAP"
        ),
        m(
          m.route.Link,
          {
            href: "/stocks",
            onclick: () => this.closeMenu(vnode),
            title: "Get Stock list",
          },
          "SCREENER"
        ),
        m(
          m.route.Link,
          {
            href: "/drawdown",
            onclick: () => this.closeMenu(vnode),
            title: "Generate bubblemap",
          },
          "DRAWDOWN"
        ),
        m(
          m.route.Link,
          {
            href: "/",
            onclick: () => this.closeMenu(vnode),
            title: "Contact US",
          },
          "MORE"
        ),
      ]),
      m("div.search", [
        m("input[type=text][placeholder=Search for a company]"),
      ]),
    ]);
  },
};

export default Header;
