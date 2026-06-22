# Your Choice Boutique - Sales KPI Dashboard

A premium, interactive e-commerce analytics ledger for **Your Choice Boutique**, designed to monitor sales volume, profit margins, returns, and demographic metrics.

## 🔗 Live Demo Links

*   **Primary Live URL**: [http://yourchoice-boutique-13421.surge.sh](http://yourchoice-boutique-13421.surge.sh)
*   **GitHub Pages Host**: [https://leslythomasmathew.github.io/yourchoicesalesdashboard/](https://leslythomasmathew.github.io/yourchoicesalesdashboard/)

---

## 📈 Key Dashboard Features

1.  **Curved Trend Analytics (Catmull-Rom Spline)**: Replaced straight line paths with smooth, sliding mathematical curves on the main cumulative GMV chart and KPI sparklines.
2.  **Dynamic Profit & Loss (P&L) Colors**: The Net Profit curve and area fill automatically transition from emerald green (profit) to crimson red (loss) whenever cohort performance goes negative.
3.  **Break-Even Line**: Highlights an explicit red-dashed horizontal baseline (`BREAK-EVEN LINE (₹0)`) during loss intervals.
4.  **Integrated Vertical Guide Tracker**: Horizontal hover-slices create a vertical guideline, scale up coordinate dots on both paths, and show a unified tooltip with metrics for both lines.
5.  **Multi-Dimensional Sync Filters**: Filters for Customer Segment (Gents Wear, Ladies Wear), Product Category (Formal Wear, Casual Wear, Festive & Ethnic, Activewear), Zonal Markets, and Timeframes.
6.  **Granular Transaction Ledger**: Sorted columns, paginated lists, and regex-powered global search queries.
7.  **Dynamic CSV Export**: Extract transaction logs with computed Net Profit/Loss calculations for offline analysis.

---

## 🛠️ How to Deploy on GitHub Pages (Hosting Instructions)

If you need to reactivate or manage the GitHub Pages deployment:

1.  Go to your repository settings page: `https://github.com/Leslythomasmathew/yourchoicesalesdashboard/settings`.
2.  In the left sidebar, under **Code and automation**, click **Pages**.
3.  Under **Build and deployment** -> **Source**, select **Deploy from a branch**.
4.  Select the **`main`** branch and the **`/ (root)`** folder, then click **Save**.
5.  Allow 1-2 minutes for the site to build. Your site will be live at `https://leslythomasmathew.github.io/yourchoicesalesdashboard/`.

---

## 💻 How to Run Locally

Since this dashboard is built using standard native HTML5, CSS3, and JavaScript, it runs locally without any build steps:

1.  Clone this repository or open the project folder:
    ```bash
    git clone https://github.com/Leslythomasmathew/yourchoicesalesdashboard.git
    cd yourchoicesalesdashboard
    ```
2.  Start a local server to bypass browser CORS file restrictions:
    ```bash
    npx http-server -p 8080
    ```
3.  Open [http://localhost:8080](http://localhost:8080) in your web browser.
