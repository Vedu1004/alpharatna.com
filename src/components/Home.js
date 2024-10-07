import m from "mithril";
import "../../public/css/home.css"; // We'll create this CSS file separately

const HomePage = {
  view: function () {
    return m("div.home-page", [
      m("main.main-content", [
        m("h2.headline", "Visualize the Market at a Glance"),
        m(
          "p.subheadline",
          "Powerful stock heatmaps and analysis tools for informed decision-making"
        ),
        m("div.cta-container", [
          m(
            "a.cta-button",
            { href: "#!/heatmap", oncreate: m.route.link },
            "View Heatmap"
          ),
          m(
            "a.cta-button.secondary",
            { href: "#!/learn", oncreate: m.route.link },
            "Learn More"
          ),
        ]),
        m("div.features", [
          m("div.feature", [
            m("i.feature-icon.fas.fa-chart-tree-map"),
            m("h3.feature-title", "Interactive Heatmaps"),
            m(
              "p.feature-description",
              "Visualize market trends with our dynamic and customizable heatmaps"
            ),
          ]),
          m("div.feature", [
            m("i.feature-icon.fas.fa-sync"),
            m("h3.feature-title", "Real-time Updates"),
            m(
              "p.feature-description",
              "Stay informed with live data streaming directly from the markets"
            ),
          ]),
          m("div.feature", [
            m("i.feature-icon.fas.fa-chart-line"),
            m("h3.feature-title", "Advanced Analytics"),
            m(
              "p.feature-description",
              "Gain insights with our powerful analytical tools and indicators"
            ),
          ]),
        ]),
      ]),
    ]);
  },
};

export default HomePage;
