import m from "mithril";
import "../../public/css/home.css";

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
      m("section.market-summary", [
        m("h3", "Market Summary"),
        m("div.market-indices", [
          m("div.index", [
            m("span.index-name", "S&P 500"),
            m("span.index-value", "4,185.47"),
            m("span.index-change.positive", "+0.45%"),
          ]),
          m("div.index", [
            m("span.index-name", "Dow Jones"),
            m("span.index-value", "33,875.40"),
            m("span.index-change.negative", "-0.22%"),
          ]),
          m("div.index", [
            m("span.index-name", "NASDAQ"),
            m("span.index-value", "12,153.41"),
            m("span.index-change.positive", "+0.75%"),
          ]),
        ]),
      ]),
      m("section.testimonials", [
        m("h3", "What Our Users Say"),
        m("div.testimonial-container", [
          m("div.testimonial", [
            m(
              "p",
              "Ratna has revolutionized how you analyze market trends. The heatmaps are incredibly insightful!"
            ),
            m("cite", "- Yash R., Professional Trader"),
          ]),
          m("div.testimonial", [
            m(
              "p",
              "As a beginner investor, the learning resources and intuitive interface have been invaluable."
            ),
            m("cite", "- Vedu J., Novice Investor"),
          ]),
        ]),
      ]),
    ]);
  },
};

export default HomePage;
