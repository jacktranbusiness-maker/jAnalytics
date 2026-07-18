"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  FileText,
  Gauge,
  Globe2,
  LayoutDashboard,
  MonitorSmartphone,
  MousePointer2,
  Radio,
  Search,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

import {
  MOCKUP_KPIS,
  MOCKUP_SITES,
  MOCKUP_SOURCES,
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

export function SonomaMockup() {
  const controls = useMockupControls();
  const focusedSites =
    controls.siteFocus === "all"
      ? MOCKUP_SITES
      : MOCKUP_SITES.filter((site) => site.id === controls.siteFocus);
  const totalActive = focusedSites.reduce((total, site) => total + site.activeUsers, 0);
  const totalUsers30m = focusedSites.reduce((total, site) => total + site.users30m, 0);
  const leadSite = focusedSites[0];

  return (
    <div className={styles.appleRoot}>
      <LabDock active="sonoma" />
      <div className={styles.appleAuroraOne} />
      <div className={styles.appleAuroraTwo} />
      <div className={styles.appleNoise} />

      <div className={styles.appleWindow}>
        <aside className={styles.appleSidebar}>
          <div className={styles.appleTrafficLights} aria-hidden="true"><i /><i /><i /></div>

          <div className={styles.appleBrand}>
            <span><BarChart3 aria-hidden="true" /></span>
            <div><strong>jAnalytics</strong><small>Live workspace</small></div>
          </div>

          <label className={styles.appleSearch}>
            <Search aria-hidden="true" />
            <span className="sr-only">Search dashboard</span>
            <input placeholder="Search" />
            <kbd>⌘ K</kbd>
          </label>

          <nav className={styles.appleNav} aria-label="Dashboard sections">
            <a className={styles.appleNavActive} href="#overview"><LayoutDashboard aria-hidden="true" /><span>Overview</span></a>
            <a href="#realtime"><Radio aria-hidden="true" /><span>Realtime</span><i>101</i></a>
            <a href="#audience"><Users aria-hidden="true" /><span>Audience</span></a>
            <a href="#content"><FileText aria-hidden="true" /><span>Content</span></a>
            <a href="#devices"><MonitorSmartphone aria-hidden="true" /><span>Devices</span></a>
          </nav>

          <div className={styles.applePropertySection}>
            <span>Websites</span>
            {MOCKUP_SITES.map((site) => (
              <button
                key={site.id}
                onClick={() => controls.setSiteFocus(site.id)}
                className={controls.siteFocus === site.id ? styles.applePropertyActive : undefined}
              >
                <i style={{ background: site.color }} />
                <span><strong>{site.shortName}</strong><small>{site.domain}</small></span>
                <b>{site.activeUsers}</b>
              </button>
            ))}
          </div>

          <article className={styles.appleSidebarSignal}>
            <WandSparkles aria-hidden="true" />
            <span>Live signal</span>
            <strong>Northstar is accelerating.</strong>
            <p>Summer collection traffic is 34% above its usual Saturday baseline.</p>
          </article>

          <div className={styles.appleProfile}>
            <span>JA</span>
            <div><strong>Jack Analytics</strong><small>2 properties connected</small></div>
            <ChevronDown aria-hidden="true" />
          </div>
        </aside>

        <div className={styles.appleMain}>
          <header className={styles.appleTopbar}>
            <div className={styles.appleTopTitle}>
              <span>jAnalytics</span>
              <h1>Live Overview</h1>
            </div>
            <div className={styles.appleTopActions}>
              <button className={styles.appleNotification} aria-label="Notifications"><Bell aria-hidden="true" /><i /></button>
              <label className={styles.appleDateControl}>
                <CalendarDays aria-hidden="true" />
                <select value={controls.range} onChange={(event) => controls.setRange(event.target.value)} aria-label="Date range">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                </select>
                <ChevronDown aria-hidden="true" />
              </label>
              <button className={styles.appleRefresh} onClick={controls.refresh} aria-label="Refresh analytics data">
                <RefreshIcon refreshing={controls.refreshing} />
              </button>
              <span className={styles.appleAvatar}><CircleUserRound aria-hidden="true" /></span>
            </div>
          </header>

          <main className={styles.appleContent} id="overview">
            <section className={styles.appleIntro}>
              <div>
                <span>Saturday · July 18 · 14:32 ICT</span>
                <h2>Both websites are alive.</h2>
                <p>Watch the audience move between commerce and editorial in one calm, synchronized space.</p>
              </div>
              <button><Sparkles aria-hidden="true" /> Ask Analytics</button>
            </section>

            <section className={styles.appleScopeControl} aria-label="Website focus">
              <button className={controls.siteFocus === "all" ? styles.appleScopeActive : undefined} onClick={() => controls.setSiteFocus("all")}>
                All websites <span>{MOCKUP_TOTAL_ACTIVE}</span>
              </button>
              {MOCKUP_SITES.map((site) => (
                <button key={site.id} className={controls.siteFocus === site.id ? styles.appleScopeActive : undefined} onClick={() => controls.setSiteFocus(site.id)}>
                  <i style={{ background: site.color }} />{site.shortName}<span>{site.activeUsers}</span>
                </button>
              ))}
            </section>

            <section className={styles.appleHeroGrid} id="realtime">
              <article className={styles.appleLiveHero}>
                <header>
                  <div><span className={styles.applePulse} /><strong>Live now</strong></div>
                  <small><i /> Synced across 2 properties · 18 sec ago</small>
                </header>
                <div className={styles.appleLiveBody}>
                  <div className={styles.appleLiveNumber}>
                    <strong>{totalActive}</strong>
                    <span>active users</span>
                    <small><ArrowUpRight aria-hidden="true" /> 9.1% above the previous 30 minutes</small>
                  </div>
                  <div className={styles.appleLiveGraph}>
                    <RealtimeComparisonGraphic compact siteFocus={controls.siteFocus} />
                    <div><span>30m ago</span><span>now</span></div>
                  </div>
                </div>
                <footer>
                  <span><Users aria-hidden="true" /><strong>{totalUsers30m}</strong> users in 30 min</span>
                  <span><MousePointer2 aria-hidden="true" /><strong>18</strong> high-intent sessions</span>
                  <span><Gauge aria-hidden="true" /><strong>60 sec</strong> refresh cadence</span>
                </footer>
              </article>

              <article className={styles.appleFocusCard}>
                <span><WandSparkles aria-hidden="true" /> Focus</span>
                <h3>{leadSite.shortName} owns the moment.</h3>
                <p>{controls.siteFocus === "all" ? "It contributes the largest share of live traffic across the workspace." : "This focused view isolates its live audience and strongest content signals."}</p>
                <div className={styles.appleFocusMeter}>
                  {focusedSites.map((site) => <span key={site.id} style={{ width: `${(site.activeUsers / totalActive) * 100}%`, background: site.color }} />)}
                </div>
                <div className={styles.appleFocusLegend}>
                  {focusedSites.map((site) => <span key={site.id}><i style={{ background: site.color }} />{site.shortName} <strong>{Math.round((site.activeUsers / totalActive) * 100)}%</strong></span>)}
                </div>
                <button>Open live insight <ArrowUpRight aria-hidden="true" /></button>
              </article>
            </section>

            <section className={`${styles.appleSiteGrid} ${focusedSites.length === 1 ? styles.appleSiteGridSingle : ""}`} aria-label="Website realtime cards">
              {focusedSites.map((site) => {
                const maxSpark = Math.max(...site.spark, 1);
                return (
                  <article key={site.id} className={styles.appleSiteCard} style={{ "--site-color": site.color, "--site-soft": site.softColor } as React.CSSProperties}>
                    <header>
                      <div className={styles.appleSiteIdentity}><i /><span><strong>{site.name}</strong><small>{site.domain}</small></span></div>
                      <span className={styles.appleLivePill}><i /> Live</span>
                    </header>
                    <div className={styles.appleSiteMetrics}>
                      <div><strong>{site.activeUsers}</strong><span>active now</span><small className={site.activeDelta >= 0 ? styles.appleUp : styles.appleDown}>{site.activeDelta >= 0 ? "+" : ""}{site.activeDelta} in 5 min</small></div>
                      <div><strong>{site.users30m}</strong><span>users · 30 min</span><small>{site.sessionsToday.toLocaleString()} sessions today</small></div>
                      <div><strong>{site.conversionRate}%</strong><span>conversion</span><small>today</small></div>
                    </div>
                    <div className={styles.appleSiteSpark} aria-label={`${site.name} active users over time`}>
                      {site.spark.map((value, index) => (
                        <i key={index} style={{ height: `${Math.max((value / maxSpark) * 100, 6)}%` }} className={index === site.spark.length - 1 ? styles.appleSparkNow : undefined} />
                      ))}
                    </div>
                    <footer><span>{site.property}</span><span>Updated {site.updatedAgo}</span></footer>
                  </article>
                );
              })}
            </section>

            <section className={styles.appleMiddleGrid}>
              <article className={styles.appleGlassPanel}>
                <header className={styles.applePanelHeader}>
                  <div><Activity aria-hidden="true" /><span><strong>Performance rhythm</strong><small>{controls.range} · both websites</small></span></div>
                  <div className={styles.appleSegments}>
                    {metrics.map((metric) => <button key={metric} onClick={() => controls.setMetric(metric)} className={controls.metric === metric ? styles.appleSegmentActive : undefined}>{metric}</button>)}
                  </div>
                </header>
                <div className={styles.appleTrendSummary}>
                  {focusedSites.map((site) => <span key={site.id}><i style={{ background: site.color }} /><strong>{site.shortName}</strong><small>{site.sessionsToday.toLocaleString()} today</small></span>)}
                </div>
                <div className={styles.appleTrendChart}><DualTrendGraphic metric={controls.metric} grid="rgba(60,60,67,.13)" siteFocus={controls.siteFocus} /></div>
              </article>

              <article className={`${styles.appleGlassPanel} ${styles.appleSignalStack}`}>
                <header className={styles.applePanelHeader}><div><Sparkles aria-hidden="true" /><span><strong>Signals</strong><small>What changed recently</small></span></div></header>
                <div className={styles.appleSignals}>
                  <div className={styles.appleSignalWarm}><i /><span><small>Northstar · 2 min ago</small><strong>Checkout activity crossed 10 active users.</strong></span><ArrowUpRight aria-hidden="true" /></div>
                  <div className={styles.appleSignalBlue}><i /><span><small>Signal · 6 min ago</small><strong>AI article traffic is 2.3× its normal pace.</strong></span><ArrowUpRight aria-hidden="true" /></div>
                  <div><i /><span><small>All sites · 9 min ago</small><strong>Mobile now represents 61% of the live audience.</strong></span><ArrowUpRight aria-hidden="true" /></div>
                </div>
              </article>
            </section>

            <section className={styles.appleBottomGrid}>
              <article className={`${styles.appleGlassPanel} ${styles.appleBreakdown}`}>
                <header className={styles.appleBreakdownHeader}>
                  <div><Globe2 aria-hidden="true" /><span><strong>Live audience detail</strong><small>Side-by-side property context</small></span></div>
                  <div className={styles.appleSegments}>
                    {realtimeTabs.map((tab) => <button key={tab} onClick={() => controls.setRealtimeTab(tab)} className={controls.realtimeTab === tab ? styles.appleSegmentActive : undefined}>{tab}</button>)}
                  </div>
                </header>
                <div className={`${styles.appleBreakdownGrid} ${focusedSites.length === 1 ? styles.appleBreakdownSingle : ""}`}>
                  {focusedSites.map((site) => {
                    const items = site.breakdowns[controls.realtimeTab];
                    const max = Math.max(...items.map((item) => item.value), 1);
                    return (
                      <div key={site.id} style={{ "--site-color": site.color } as React.CSSProperties}>
                        <header><span><i />{site.shortName}</span><small>{site.activeUsers} live</small></header>
                        {items.map((item) => (
                          <div className={styles.appleBreakdownRow} key={item.label}>
                            <span><strong>{item.label}</strong><small>{item.meta}</small></span>
                            <i><b style={{ width: `${(item.value / max) * 100}%` }} /></i>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={`${styles.appleGlassPanel} ${styles.appleSources}`}>
                <header className={styles.applePanelHeader}><div><MousePointer2 aria-hidden="true" /><span><strong>Top channels</strong><small>Combined today</small></span></div><button>See all</button></header>
                <div>
                  {MOCKUP_SOURCES.map((source, index) => (
                    <div key={source.source}>
                      <span>{index + 1}</span>
                      <strong>{source.source}</strong>
                      <i><b style={{ width: `${source.share}%` }} /></i>
                      <small>{source.sessions}</small>
                    </div>
                  ))}
                </div>
                <footer>
                  {MOCKUP_KPIS.slice(2).map((kpi) => <span key={kpi.key}><strong>{kpi.value}</strong><small>{kpi.label}</small></span>)}
                </footer>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
