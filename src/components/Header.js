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
          { href: "/", onclick: () => this.closeMenu(vnode) },
          "HOME"
        ),
        m(
          m.route.Link,
          { href: "/heatmap", onclick: () => this.closeMenu(vnode) },
          "HEATMAP"
        ),
        m(
          m.route.Link,
          { href: "/feed", onclick: () => this.closeMenu(vnode) },
          "FEED"
        ),
        m(
          m.route.Link,
          { href: "/", onclick: () => this.closeMenu(vnode) },
          "NEWS"
        ),
        m(
          m.route.Link,
          { href: "/", onclick: () => this.closeMenu(vnode) },
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
