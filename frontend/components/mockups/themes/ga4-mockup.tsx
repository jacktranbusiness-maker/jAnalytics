"use client";

import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileBarChart,
  Globe2,
  Home,
  Layers3,
  Menu,
  MonitorSmartphone,
  MousePointerClick,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  MOCKUP_KPIS,
  MOCKUP_SITES,
  MOCKUP_TOTAL_ACTIVE,
  type MockupMetric,
  type RealtimeTab,
} from "@/lib/mockup-data";
import {
  DualTrendGraphic,
  LabDock,
  RealtimeComparisonGraphic,
  RefreshIcon,
  useMockupControls,
} from "@/components/mockups/mockup-shared";

import styles from "../theme-lab.module.css";

const metrics: MockupMetric[] = ["Sessions", "Users", "Views"];
const realtimeTabs: RealtimeTab[] = ["Pages", "Countries", "Devices"];

export function Ga4Mockup() {
  const controls = useMockupControls();
  const focusedSites =
    controls.siteFocus === "all"
      ? MOCKUP_SITES
      : MOCKUP_SITES.filter((site) => site.id === controls.siteFocus);
  const totalActive = focusedSites.reduce((total, site) => total + site.activeUsers, 0);
  const totalUsers30m = focusedSites.reduce((total, site) => total + site.users30m, 0);
  const leadSite = focusedSites[0];
  const leadShare = Math.round((leadSite.activeUsers / totalActive) * 100);

  return (
    <div className={styles.ga2Root}>
      <LabDock active="ga4" />

      <header className={styles.ga2GlobalHeader}>
        <div className={styles.ga2BrandGroup}>
          <button className={styles.ga2RoundButton} aria-label="Open navigation">
            <Menu aria-hidden="true" />
          </button>
          <span className={styles.ga2Logo} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <strong>Analytics</strong>
          <span className={styles.ga2HeaderDivider} />
          <button className={styles.ga2AccountPicker}>
            <span>jAnalytics workspace</span>
            <small>2 web properties</small>
            <ChevronDown aria-hidden="true" />
          </button>
        </div>

        <label className={styles.ga2Search}>
          <Search aria-hidden="true" />
          <span className="sr-only">Search Analytics</span>
          <input placeholder="Try searching ‘active users by website’" />
          <kbd>/</kbd>
        </label>

        <div className={styles.ga2HeaderActions}>
          <button aria-label="Help"><CircleHelp aria-hidden="true" /></button>
          <button aria-label="Notifications"><Bell aria-hidden="true" /><i /></button>
          <button aria-label="Settings"><Settings aria-hidden="true" /></button>
          <span className={styles.ga2Avatar}>JA</span>
        </div>
      </header>

      <div className={styles.ga2Workspace}>
        <aside className={styles.ga2Rail}>
          <nav aria-label="Analytics sections">
            <a className={styles.ga2RailActive} href="#overview"><Home aria-hidden="true" /><span>Home</span></a>
            <a href="#realtime"><Radio aria-hidden="true" /><span>Realtime</span></a>
            <a href="#reports"><FileBarChart aria-hidden="true" /><span>Reports</span></a>
            <a href="#explore"><Layers3 aria-hidden="true" /><span>Explore</span></a>
          </nav>
          <button aria-label="Admin"><Settings aria-hidden="true" /><span>Admin</span></button>
        </aside>

        <main className={styles.ga2Main} id="overview">
          <div className={styles.ga2Breadcrumbs}>
            <span>Reports</span><ChevronRight aria-hidden="true" /><span>Realtime</span><ChevronRight aria-hidden="true" /><strong>All websites</strong>
          </div>

          <section className={styles.ga2PageHeader}>
            <div>
              <div className={styles.ga2TitleRow}>
                <h1>Realtime overview</h1>
                <span className={styles.ga2Verified}><ShieldCheck aria-hidden="true" /> Data quality: good</span>
              </div>
              <p>Compare live activity across both GA4 web properties in one synchronized view.</p>
            </div>
            <div className={styles.ga2PageActions}>
              <span className={styles.ga2Updated}><i /> Updated 18 seconds ago</span>
              <label className={styles.ga2DateControl}>
                <CalendarDays aria-hidden="true" />
                <select value={controls.range} onChange={(event) => controls.setRange(event.target.value)} aria-label="Date range">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
              <button className={styles.ga2Refresh} onClick={controls.refresh} aria-label="Refresh analytics data">
                <RefreshIcon refreshing={controls.refreshing} />
              </button>
            </div>
          </section>

          <section className={styles.ga2PropertyBar} aria-label="Website filter">
            <div className={styles.ga2PropertyTabs}>
              <button
                className={controls.siteFocus === "all" ? styles.ga2PropertyActive : undefined}
                onClick={() => controls.setSiteFocus("all")}
              >
                <span className={styles.ga2AllIcon}><Globe2 aria-hidden="true" /></span>
                <span><strong>All websites</strong><small>{MOCKUP_TOTAL_ACTIVE} active now</small></span>
              </button>
              {MOCKUP_SITES.map((site) => (
                <button
                  key={site.id}
                  className={controls.siteFocus === site.id ? styles.ga2PropertyActive : undefined}
                  onClick={() => controls.setSiteFocus(site.id)}
                >
                  <i style={{ background: site.color }} />
                  <span><strong>{site.shortName}</strong><small>{site.domain}</small></span>
                </button>
              ))}
            </div>
            <button className={styles.ga2Customize}><Settings aria-hidden="true" /> Customize</button>
          </section>

          <section className={styles.ga2SummaryGrid} aria-label="Realtime summary">
            <article className={`${styles.ga2SummaryCard} ${styles.ga2TotalCard}`}>
              <header><span>All websites</span><small>Live</small></header>
              <div className={styles.ga2TotalValue}>
                <strong>{totalActive}</strong>
                <span>active users now</span>
              </div>
              <div className={styles.ga2TotalMeta}>
                <span><Users aria-hidden="true" /> {totalUsers30m} users in 30 min</span>
                <span><ArrowUpRight aria-hidden="true" /> +8.7% vs prior 30 min</span>
              </div>
            </article>

            {focusedSites.map((site) => {
              const maxSpark = Math.max(...site.spark, 1);
              return (
                <article className={styles.ga2SiteCard} key={site.id} style={{ "--site-color": site.color, "--site-soft": site.softColor } as React.CSSProperties}>
                  <header>
                    <div><i /><span><strong>{site.name}</strong><small>{site.domain}</small></span></div>
                    <button aria-label={`Open ${site.name}`}><ChevronRight aria-hidden="true" /></button>
                  </header>
                  <div className={styles.ga2SiteValue}>
                    <strong>{site.activeUsers}</strong>
                    <span>active now</span>
                    <small className={site.activeDelta >= 0 ? styles.ga2Positive : styles.ga2Negative}>
                      {site.activeDelta >= 0 ? "+" : ""}{site.activeDelta} in 5 min
                    </small>
                  </div>
                  <div className={styles.ga2MiniBars} aria-label={`${site.name} activity over 30 minutes`}>
                    {site.spark.slice(-18).map((value, index) => (
                      <i key={index} style={{ height: `${Math.max((value / maxSpark) * 100, 8)}%` }} />
                    ))}
                  </div>
                  <footer><span>{site.property}</span><span>{site.updatedAgo}</span></footer>
                </article>
              );
            })}
          </section>

          <section className={styles.ga2HeroGrid} id="realtime">
            <article className={`${styles.ga2Panel} ${styles.ga2TimelinePanel}`}>
              <header className={styles.ga2PanelHeader}>
                <div><Activity aria-hidden="true" /><span><strong>Active users per minute</strong><small>Last 30 minutes · synchronized</small></span></div>
                <div className={styles.ga2Legend}>
                  {focusedSites.map((site) => <span key={site.id}><i style={{ background: site.color }} />{site.shortName}</span>)}
                </div>
              </header>
              <div className={styles.ga2RealtimeChart}><RealtimeComparisonGraphic siteFocus={controls.siteFocus} /></div>
              <div className={styles.ga2Axis}><span>30 min ago</span><span>20 min</span><span>10 min</span><strong>Now</strong></div>
            </article>

            <article className={`${styles.ga2Panel} ${styles.ga2PulsePanel}`}>
              <header className={styles.ga2PanelHeader}>
                <div><Clock3 aria-hidden="true" /><span><strong>Live distribution</strong><small>Share of active users</small></span></div>
              </header>
              <div
                className={styles.ga2ShareDonut}
                style={{
                  "--share-stop": `${leadShare}%`,
                  "--share-a": leadSite.color,
                  "--share-b": focusedSites[1]?.color ?? leadSite.color,
                } as React.CSSProperties}
              >
                <div><strong>{totalActive}</strong><span>total</span></div>
              </div>
              <div className={styles.ga2ShareRows}>
                {focusedSites.map((site) => (
                  <div key={site.id}>
                    <span><i style={{ background: site.color }} />{site.shortName}</span>
                    <strong>{site.activeUsers}</strong>
                    <small>{Math.round((site.activeUsers / totalActive) * 100)}%</small>
                  </div>
                ))}
              </div>
              <div className={styles.ga2PulseNote}><Sparkles aria-hidden="true" /><span>{leadSite.shortName} is driving the strongest current signal in this view.</span></div>
            </article>
          </section>

          <section className={`${styles.ga2Panel} ${styles.ga2Breakdown}`}>
            <header className={styles.ga2BreakdownHeader}>
              <div>
                <h2>Live breakdown</h2>
                <p>Compare what people are viewing, where they are, and which devices they use.</p>
              </div>
              <div className={styles.ga2BreakdownTabs}>
                {realtimeTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => controls.setRealtimeTab(tab)}
                    className={controls.realtimeTab === tab ? styles.ga2BreakdownActive : undefined}
                  >
                    {tab === "Pages" ? <FileBarChart aria-hidden="true" /> : tab === "Countries" ? <Globe2 aria-hidden="true" /> : <MonitorSmartphone aria-hidden="true" />}
                    {tab}
                  </button>
                ))}
              </div>
            </header>
            <div className={`${styles.ga2BreakdownGrid} ${focusedSites.length === 1 ? styles.ga2BreakdownSingle : ""}`}>
              {focusedSites.map((site) => {
                const items = site.breakdowns[controls.realtimeTab];
                const max = Math.max(...items.map((item) => item.value), 1);
                return (
                  <article key={site.id} style={{ "--site-color": site.color } as React.CSSProperties}>
                    <header><span><i />{site.name}</span><small>ACTIVE USERS</small></header>
                    <div className={styles.ga2Rows}>
                      {items.map((item, index) => (
                        <div key={item.label}>
                          <span className={styles.ga2Rank}>{index + 1}</span>
                          <span className={styles.ga2RowLabel}><strong>{item.label}</strong><small>{item.meta}</small></span>
                          <span className={styles.ga2RowBar}><i style={{ width: `${(item.value / max) * 100}%` }} /></span>
                          <strong className={styles.ga2RowValue}>{item.value}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.ga2BottomGrid} id="reports">
            <article className={`${styles.ga2Panel} ${styles.ga2TrendPanel}`}>
              <header className={styles.ga2PanelHeader}>
                <div><FileBarChart aria-hidden="true" /><span><strong>Property performance</strong><small>{controls.range} · compared on one scale</small></span></div>
                <div className={styles.ga2MetricTabs}>
                  {metrics.map((metric) => (
                    <button key={metric} onClick={() => controls.setMetric(metric)} className={controls.metric === metric ? styles.ga2MetricActive : undefined}>{metric}</button>
                  ))}
                </div>
              </header>
              <div className={styles.ga2TrendSummary}>
                {focusedSites.map((site) => (
                  <div key={site.id}><span><i style={{ background: site.color }} />{site.shortName}</span><strong>{site.sessionsToday.toLocaleString()}</strong><small>sessions today</small></div>
                ))}
              </div>
              <div className={styles.ga2TrendChart}><DualTrendGraphic metric={controls.metric} grid="#e8eaed" siteFocus={controls.siteFocus} /></div>
            </article>

            <article className={`${styles.ga2Panel} ${styles.ga2InsightPanel}`}>
              <span className={styles.ga2InsightIcon}><Sparkles aria-hidden="true" /></span>
              <small>Realtime opportunity</small>
              <h2>Turn Northstar’s product spike into conversions.</h2>
              <p>Traffic to the summer collection is 34% above baseline, while checkout activity is holding at 17% of live users.</p>
              <div className={styles.ga2InsightStats}>
                {MOCKUP_KPIS.slice(0, 2).map((kpi) => <span key={kpi.key}><strong>{kpi.value}</strong><small>{kpi.label}</small></span>)}
              </div>
              <button>Open insight <ArrowUpRight aria-hidden="true" /></button>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
