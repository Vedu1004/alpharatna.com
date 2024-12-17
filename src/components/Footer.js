import m from "mithril";
import "../../public/css/footer.css";
import store from "../store/store";
const Footer = {
  view: function () {
    const isSidebar = store.getSidebarState();
    return m(
      "footer",
      {
        style: isSidebar ? "margin-left: 20vw;" : "margin-left: 0vw;",
      },
      [
        m("div.logo", [
          m("img", { src: "/images/ratna.png", alt: "Ratna Logo" }),
          m("span", "𝖗𝖆𝖙𝖓𝖆"),
        ]),
        m("p", "Stock analysis and screening tool"),
        m("p", "Trigarth Sytamagic Private Ltd © 2024"),
        m("p", "Data provided by Finvasa shoony SDK"),
        m(
          "p",
          "All information is provided “as-is” for informational purposes only, not for trading or financial advice."
        ),
        m(
          "p",
          "Disclaimer: Trigarth Sytamagic Pvt Ltd does not warrant the accuracy or completeness of the data provided. Use at your own risk."
        ),
        m("p", "Terms & Privacy | Cookie Policy | Support | Contact Us"),
      ]
    );
  },
};

export default Footer;
