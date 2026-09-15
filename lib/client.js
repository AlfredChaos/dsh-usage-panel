// dsh-usage-panel · Client bundle (web plugin `./client` export)
// Built from src/client via esbuild + scripts/wrap-client.mjs. Registers the
// settings page "消耗统计 / Usage" (settings.section) with KPI cards, activity
// heatmap, stacked daily bars, model donut, session ranking, provider
// breakdown and CSV/JSON export. Data arrives over the package's own RPC
// channel /usage-stats (loopback authority).
window.__ModuleLoader__.load({
  id: 'dsh-usage-panel',
  factory: function (require) {
    var module = { exports: {} }
    var exports = module.exports
    var React = require('react')
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

    // src/client/index.tsx
    var index_exports = {};
    __export(index_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(index_exports);
    var import_react6 = require("react");

    // src/client/locales.ts
    var NS = "usage-panel";
    var zhCN = {
      "nav.label": "\u6D88\u8017\u7EDF\u8BA1",
      "nav.subtitle": "\u53EA\u8BFB\u91CD\u7B97\u4F1A\u8BDD\u65E5\u5FD7 \xB7 \u6C38\u4E0D\u5199\u56DE",
      "kpi.total": "Token \u603B\u7528\u91CF",
      "kpi.total.detail": "\u8F93\u5165 {input} \xB7 \u8F93\u51FA {output}",
      "kpi.sessions": "\u603B\u4F1A\u8BDD\u6570\u91CF",
      "kpi.sessions.detail": "\u603B\u4F1A\u8BDD {total} \xB7 \u6709\u7528\u91CF\u4F1A\u8BDD\uFF1A\u4E3B {main} \xB7 \u5B50\u4EE3\u7406 {subagent}",
      "kpi.topModel": "\u6700\u5E38\u7528\u6A21\u578B",
      "kpi.topModel.detail": "\u5360\u6BD4 {pct}%",
      "kpi.hitRate": "\u7F13\u5B58\u547D\u4E2D\u7387",
      "kpi.hitRate.detail": "\u8BFB {read} \xB7 \u5199 {write}",
      "kpi.hitRate.none": "\u6682\u65E0\u7F13\u5B58\u6570\u636E",
      "heat.title": "\u6D3B\u8DC3\u70ED\u529B\u56FE",
      "heat.sub": "\u6700\u8FD1\u534A\u5E74 \xB7 UTC",
      "heat.less": "\u5C11",
      "heat.more": "\u591A",
      "heat.day": "{date} \xB7 {tokens} Tokens",
      "bar.title": "\u6BCF\u65E5 Token \u7528\u91CF",
      "bar.sub": "\u6309\u6A21\u578B\u5806\u53E0",
      "bar.day": "{date} \xB7 \u5171 {tokens} Tokens",
      "donut.title": "\u6A21\u578B\u7528\u91CF",
      "donut.model": "\u6A21\u578B",
      "donut.tokens": "\u7528\u91CF",
      "donut.cap": "Token \u603B\u7528\u91CF",
      "donut.other": "\u5176\u4ED6",
      "donut.share": "\u5360\u6BD4",
      "donut.hitRate": "\u547D\u4E2D\u7387",
      "sessions.title": "\u4F1A\u8BDD\u7528\u91CF\u6392\u884C",
      "sessions.sub": "\u6309\u5168\u90E8\u5386\u53F2\u7528\u91CF",
      "sessions.untitled": "\u672A\u547D\u540D\u4F1A\u8BDD",
      "sessions.main": "\u4E3B\u4F1A\u8BDD",
      "sessions.subagent": "\u5B50\u4EE3\u7406",
      "sessions.tokens": "{tokens} Tokens",
      "sessions.lastActive": "\u6700\u8FD1\u6D3B\u8DC3 {date}",
      "providers.title": "\u670D\u52A1\u5546\u7528\u91CF",
      "export.button": "\u5BFC\u51FA",
      "export.json": "\u5BFC\u51FA JSON",
      "export.daily": "\u5BFC\u51FA\u6BCF\u65E5 CSV",
      "export.models": "\u5BFC\u51FA\u6A21\u578B CSV",
      "export.file.daily": "dsh-usage-panel-daily.csv",
      "export.file.models": "dsh-usage-panel-models.csv",
      "export.file.json": "dsh-usage-panel-overview.json",
      "refresh.button": "\u5237\u65B0",
      "refresh.loading": "\u5237\u65B0\u4E2D\u2026",
      "refresh.title": "\u91CD\u65B0\u62C9\u53D6\u6700\u65B0\u7EDF\u8BA1",
      "status.loading": "\u6B63\u5728\u7EDF\u8BA1\u4F1A\u8BDD\u65E5\u5FD7\u2026",
      "status.loading.hint": "\u63D2\u4EF6\u52A0\u8F7D\u65F6\u5DF2\u5F00\u59CB\u9884\u70ED\uFF0C\u901A\u5E38\u53EA\u9700\u7B49\u5F85\u7247\u523B",
      "status.fresh": "\u6570\u636E\u66F4\u65B0\u4E8E {time} \xB7 UTC",
      "status.stale": "\u6570\u636E\u66F4\u65B0\u4E8E {time} \xB7 \u540E\u53F0\u66F4\u65B0\u4E2D\u2026",
      "status.fallback": "\u663E\u793A\u7F13\u5B58\u6570\u636E\uFF08\u66F4\u65B0\u5931\u8D25\u4E8E {time}\uFF09",
      "status.error": "\u52A0\u8F7D\u5931\u8D25\uFF1A{msg}",
      "empty.title": "\u6682\u65E0\u7EDF\u8BA1\u6570\u636E",
      "empty.hint": "\u5F00\u59CB\u4F7F\u7528 DeepSeek Harness \u540E\uFF0C\u8FD9\u91CC\u4F1A\u5C55\u793A Token \u6D88\u8017\u60C5\u51B5",
      "error.title": "\u7EDF\u8BA1\u9762\u677F\u5D29\u6E83\u4E86",
      "error.reset": "\u6E05\u7A7A\u7F13\u5B58\u5E76\u91CD\u8BD5",
      "error.detail": "\u9519\u8BEF\u4FE1\u606F\uFF1A{msg}",
      "unit.tokens": "{n} Tokens",
      "date.today": "\u4ECA\u5929"
    };
    var enUS = {
      "nav.label": "Usage",
      "nav.subtitle": "Read-only session log stats \xB7 never writes back",
      "kpi.total": "Total tokens",
      "kpi.total.detail": "In {input} \xB7 Out {output}",
      "kpi.sessions": "Sessions",
      "kpi.sessions.detail": "Total {total} \xB7 with usage: main {main} \xB7 subagent {subagent}",
      "kpi.topModel": "Top model",
      "kpi.topModel.detail": "Share {pct}%",
      "kpi.hitRate": "Cache hit rate",
      "kpi.hitRate.detail": "Read {read} \xB7 Write {write}",
      "kpi.hitRate.none": "No cache data yet",
      "heat.title": "Activity heatmap",
      "heat.sub": "Last 6 months \xB7 UTC",
      "heat.less": "Less",
      "heat.more": "More",
      "heat.day": "{date} \xB7 {tokens} tokens",
      "bar.title": "Daily token usage",
      "bar.sub": "Stacked by model",
      "bar.day": "{date} \xB7 {tokens} tokens total",
      "donut.title": "Model usage",
      "donut.model": "Model",
      "donut.tokens": "Tokens",
      "donut.cap": "Total tokens",
      "donut.other": "Other",
      "donut.share": "Share",
      "donut.hitRate": "Hit rate",
      "sessions.title": "Top sessions",
      "sessions.sub": "By all-time usage",
      "sessions.untitled": "Untitled session",
      "sessions.main": "Main",
      "sessions.subagent": "Subagent",
      "sessions.tokens": "{tokens} tokens",
      "sessions.lastActive": "Active {date}",
      "providers.title": "Providers",
      "export.button": "Export",
      "export.json": "Export JSON",
      "export.daily": "Export daily CSV",
      "export.models": "Export model CSV",
      "export.file.daily": "dsh-usage-panel-daily.csv",
      "export.file.models": "dsh-usage-panel-models.csv",
      "export.file.json": "dsh-usage-panel-overview.json",
      "refresh.button": "Refresh",
      "refresh.loading": "Refreshing\u2026",
      "refresh.title": "Fetch the latest statistics",
      "status.loading": "Scanning session logs\u2026",
      "status.loading.hint": "A warm-up scan started when the plugin loaded; this usually takes a moment",
      "status.fresh": "Updated at {time} \xB7 UTC",
      "status.stale": "Updated at {time} \xB7 refreshing in background\u2026",
      "status.fallback": "Showing cached data (last refresh failed at {time})",
      "status.error": "Failed to load: {msg}",
      "empty.title": "No statistics yet",
      "empty.hint": "Start using DeepSeek Harness and token usage will show up here",
      "error.title": "The usage panel crashed",
      "error.reset": "Clear cache and retry",
      "error.detail": "Error: {msg}",
      "unit.tokens": "{n} tokens",
      "date.today": "Today"
    };
    function interpolate(text, params) {
      if (!params) return text;
      return text.replace(/\{(\w+)\}/g, (_, name) => {
        const v = params[name];
        return v === void 0 ? "{" + name + "}" : String(v);
      });
    }
    var DICTS = { "zh-CN": zhCN, "en-US": enUS };
    function lookup(locale, key) {
      const dict = DICTS[locale];
      if (dict && dict[key]) return dict[key];
      return DICTS["zh-CN"][key] || key;
    }
    function createI18n(runtime) {
      if (!runtime) {
        return {
          t: (key, params) => interpolate(lookup("zh-CN", key), params),
          locale: "zh-CN",
          subscribe: () => () => {
          },
          getSnapshot: () => "zh-CN",
          update: () => {
          },
          dispose: () => {
          }
        };
      }
      const rt = runtime;
      const listeners = /* @__PURE__ */ new Set();
      let active = normalizeLocale(rt.getSnapshot().active);
      try {
        rt.register(NS, { zh: zhCN, en: enUS });
      } catch {
      }
      const translated = rt.bind(NS);
      const resolve = (key, params) => {
        let text;
        try {
          text = translated(key);
        } catch {
          text = void 0;
        }
        if (!text || text === key) text = lookup(active, key);
        return interpolate(text, params);
      };
      function update() {
        const next = normalizeLocale(rt.getSnapshot().active);
        if (next !== active) {
          active = next;
          for (const cb of listeners) cb();
        }
      }
      const disposeRuntimeSub = rt.subscribe ? rt.subscribe(update) : null;
      return {
        t: resolve,
        // Getter: `locale` must track switches (the field itself would be a
        // creation-time snapshot).
        get locale() {
          return active;
        },
        subscribe: (cb) => {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        getSnapshot: () => active,
        update,
        dispose: () => {
          if (disposeRuntimeSub) disposeRuntimeSub();
        }
      };
    }
    function normalizeLocale(id) {
      return id && id.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
    }

    // src/client/styles.ts
    var STYLE_ID = "dsh-usage-panel/styles";
    var CSS = [
      ".dsw-ust-root{position:relative;display:flex;flex-direction:column;gap:14px;padding:18px 20px 28px;min-width:0}",
      ".dsw-ust-tooltip{position:fixed;left:0;top:0;transform:translate(-50%,-110%);background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);padding:5px 10px;border-radius:6px;font-size:11px;white-space:nowrap;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.06);opacity:0;transition:opacity .1s;z-index:9999}",
      ".dsw-ust-tooltip.show{opacity:1}",
      ".dsw-ust-tooltip-title{font-size:11px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:4px;white-space:nowrap}",
      ".dsw-ust-tooltip-row{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;line-height:1.6}",
      ".dsw-ust-tooltip-row i{width:8px;height:8px;border-radius:50%;flex-shrink:0;display:inline-block}",
      ".dsw-ust-tooltip-row .dsw-ust-tooltip-label{flex:1;color:var(--dsw-alias-label-primary)}",
      ".dsw-ust-tooltip-row .dsw-ust-tooltip-value{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
      ".dsw-ust-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}",
      ".dsw-ust-head h2{margin:0;font-size:16px;font-weight:650;color:var(--dsw-alias-label-primary)}",
      ".dsw-ust-head-title{display:flex;align-items:flex-start;gap:8px;min-width:0}",
      ".dsw-ust-page-icon{flex-shrink:0;margin-top:2px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-sub{margin-top:3px;font-size:11px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-head-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}",
      ".dsw-ust-refresh{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 11px;font-size:12px;cursor:pointer}",
      ".dsw-ust-refresh:hover{border-color:var(--dsw-alias-border-l2)}",
      ".dsw-ust-refresh:disabled{opacity:.55;cursor:default}",
      ".dsw-ust-export{position:relative}",
      ".dsw-ust-export-menu{position:absolute;right:0;top:calc(100% + 4px);min-width:150px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,.12);z-index:9000}",
      ".dsw-ust-export-menu button{display:block;width:100%;text-align:left;border:none;background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;padding:7px 10px;border-radius:6px;cursor:pointer}",
      ".dsw-ust-export-menu button:hover{background:var(--dsw-alias-bg-layer-2)}",
      ".dsw-ust-card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:14px 16px;min-width:0}",
      ".dsw-ust-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;flex-wrap:wrap}",
      ".dsw-ust-card h3{margin:0 0 12px;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".dsw-ust-card-head h3{margin:0}",
      ".dsw-ust-card-title{display:flex;align-items:baseline;gap:8px;min-width:0}",
      ".dsw-ust-card-sub{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}",
      ".dsw-ust-kpi{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;padding:13px 15px;min-width:0}",
      ".dsw-ust-kpi .l{font-size:11px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-kpi .v{margin-top:7px;font-size:19px;font-weight:700;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;line-height:1.2;word-break:break-all}",
      ".dsw-ust-kpi .v-sm{font-size:15px}",
      ".dsw-ust-kpi .d{margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-range{display:inline-flex;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden;flex-shrink:0}",
      ".dsw-ust-range button{border:none;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11px;padding:5px 11px;cursor:pointer}",
      ".dsw-ust-range button:hover{color:var(--dsw-alias-label-primary)}",
      ".dsw-ust-range button.on{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-weight:600}",
      ".dsw-ust-chart{width:100%;height:auto;display:block}",
      ".dsw-ust-axis{fill:var(--dsw-alias-label-secondary);font-size:10px;font-family:inherit}",
      ".dsw-ust-legend{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:10px}",
      ".dsw-ust-legend-item{display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-legend-item i{width:9px;height:9px;border-radius:3px;display:inline-block}",
      ".dsw-ust-models{display:flex;gap:18px;align-items:center;flex-wrap:wrap}",
      ".dsw-ust-donut{flex-shrink:0}",
      ".dsw-ust-donut-seg{cursor:pointer;transition:stroke-width .15s}",
      ".dsw-ust-donut-seg:hover{stroke-width:28px}",
      ".dsw-ust-donut-total{fill:var(--dsw-alias-label-primary);font-size:17px;font-weight:700;font-family:inherit}",
      ".dsw-ust-donut-cap{fill:var(--dsw-alias-label-secondary);font-size:10px;font-family:inherit}",
      ".dsw-ust-mlist{flex:1 1 190px;min-width:170px}",
      ".dsw-ust-mhead{display:flex;align-items:center;gap:9px;padding:0 2px 6px;font-size:10px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-mhead .h-model{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dsw-ust-mhead .h-share{width:52px;text-align:right}",
      ".dsw-ust-mhead .h-rate{width:56px;text-align:right}",
      ".dsw-ust-mrate{width:56px;text-align:right;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;flex-shrink:0}",
      ".dsw-ust-mrow{display:flex;align-items:center;gap:9px;padding:6px 2px;font-size:12px;min-width:0}",
      ".dsw-ust-mrow+.dsw-ust-mrow{border-top:1px solid var(--dsw-alias-border-l1)}",
      ".dsw-ust-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}",
      ".dsw-ust-mname{flex:1;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}",
      ".dsw-ust-mtokens{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}",
      ".dsw-ust-mpct{width:52px;text-align:right;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}",
      ".dsw-ust-empty{background:var(--dsw-alias-bg-layer-1);border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;padding:34px 20px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.8}",
      ".dsw-ust-empty-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);margin-bottom:4px}",
      ".dsw-ust-heat-wrap{position:relative;display:flex;gap:0;align-items:flex-start;overflow-x:auto;padding-bottom:2px;scrollbar-width:none;-ms-overflow-style:none}",
      ".dsw-ust-heat-wrap::-webkit-scrollbar{display:none}",
      ".dsw-ust-heat-weekdays{position:absolute;left:0;top:17px;bottom:2px;display:grid;grid-template-rows:repeat(7,1fr);gap:3px;width:10px;font-size:10px;color:var(--dsw-alias-label-secondary);margin:0}",
      ".dsw-ust-heat-weekdays span{display:flex;align-items:center;align-self:center;height:12px;line-height:12px}",
      ".dsw-ust-heat-main{min-width:0;flex:1 1 auto;margin-left:18px}",
      ".dsw-ust-heat-months{display:grid;gap:3px;width:100%;height:14px;margin-bottom:3px;font-size:10px;color:var(--dsw-alias-label-secondary)}",
      ".dsw-ust-heat-month{white-space:nowrap;min-width:0}",
      ".dsw-ust-heat{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,auto);width:100%;min-width:max-content;gap:3px}",
      ".dsw-ust-heat-cell{aspect-ratio:1/1;border-radius:2px;cursor:default;animation:dsw-ust-heat-in .45s linear both}",
      ".dsw-ust-heat-cell:hover{box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}",
      ".dsw-ust-heat-blank{background:transparent;cursor:default;animation:none}",
      ".dsw-ust-h0{background:#eef2f7}",
      ".dsw-ust-h1{background:#dbeafe}",
      ".dsw-ust-h2{background:#93c5fd}",
      ".dsw-ust-h3{background:#3b82f6}",
      ".dsw-ust-h4{background:#1d4ed8}",
      "body[data-ds-dark-theme] .dsw-ust-h0{background:#1f2937}",
      "body[data-ds-dark-theme] .dsw-ust-h1{background:#1e3a8a}",
      "body[data-ds-dark-theme] .dsw-ust-h2{background:#2563eb}",
      "body[data-ds-dark-theme] .dsw-ust-h3{background:#3b82f6}",
      "body[data-ds-dark-theme] .dsw-ust-h4{background:#60a5fa}",
      ".dsw-ust-heat-legend{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--dsw-alias-label-secondary);flex-shrink:0}",
      ".dsw-ust-heat-swatch{width:10px;height:10px;border-radius:2px;display:inline-block}",
      ".dsw-ust-bar-seg{transform-origin:bottom;transform-box:fill-box;animation:dsw-ust-bar-grow .9s cubic-bezier(.16,1,.3,1) both}",
      ".dsw-ust-donut-seg{transform-box:fill-box;transform-origin:center;animation:dsw-ust-donut-spin .9s cubic-bezier(.16,1,.3,1) both}",
      "@keyframes dsw-ust-bar-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}",
      "@keyframes dsw-ust-donut-spin{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}",
      // Heatmap entrance: a left-to-right opacity wipe. Each week column starts
      // its fade at w*0.018s and ramps linearly to opaque over 0.45s (≈0.9s total
      // for 26 weeks), mirroring the promo GIF. Per-column delay is set inline on
      // each cell in Heatmap.tsx; blanks opt out via .dsw-ust-heat-blank above.
      "@keyframes dsw-ust-heat-in{from{opacity:0}to{opacity:1}}",
      "@media (prefers-reduced-motion:reduce){.dsw-ust-heat-cell{animation:none}}",
      // ---- v0.2 additions ----
      ".dsw-ust-srow{display:flex;align-items:center;gap:10px;padding:7px 2px;font-size:12px;min-width:0}",
      ".dsw-ust-srow+.dsw-ust-srow{border-top:1px solid var(--dsw-alias-border-l1)}",
      ".dsw-ust-srank{width:20px;flex-shrink:0;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:11px}",
      ".dsw-ust-sname{flex:1;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}",
      ".dsw-ust-smeta{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;flex-shrink:0}",
      ".dsw-ust-stag{font-size:10px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);border-radius:4px;padding:0 5px;flex-shrink:0;line-height:16px}",
      ".dsw-ust-stag.sub{color:#8b5cf6;border-color:rgba(139,92,246,.45)}",
      ".dsw-ust-stokens{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;white-space:nowrap;flex-shrink:0}",
      ".dsw-ust-prow{display:flex;align-items:center;gap:10px;padding:6px 2px;font-size:12px;min-width:0}",
      ".dsw-ust-prow+.dsw-ust-prow{border-top:1px solid var(--dsw-alias-border-l1)}",
      ".dsw-ust-pbar{flex:1;height:6px;border-radius:3px;background:var(--dsw-alias-bg-layer-2);overflow:hidden;min-width:60px}",
      ".dsw-ust-pbar i{display:block;height:100%;border-radius:3px}",
      ".dsw-ust-pname{width:140px;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0}",
      ".dsw-ust-ptokens{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;white-space:nowrap;flex-shrink:0}"
    ].join("\n");

    // src/client/StatsSection.tsx
    var import_react4 = require("react");

    // src/shared/usage.ts
    function parseDayKeyUTC(key) {
      const p = key.split("-");
      return new Date(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])));
    }
    function keyOfDateUTC(d) {
      return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
    }
    function hitRate(b) {
      const denominator = b.input + b.cacheRead + b.cacheWrite;
      if (denominator <= 0) return null;
      return b.cacheRead / denominator;
    }

    // src/shared/format.ts
    function fmtTokens(n, locale) {
      const v = Math.round(n || 0);
      if (locale === "zh-CN") {
        if (v >= 1e8) return (v / 1e8).toFixed(2).replace(/\.?0+$/, "") + " \u4EBF";
        if (v >= 1e4) return (v / 1e4).toFixed(1).replace(/\.0$/, "") + " \u4E07";
        return String(v);
      }
      if (v >= 1e9) return (v / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
      if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
      return String(v);
    }
    function fmtCompact(n, locale) {
      const v = Math.round(n || 0);
      if (locale === "zh-CN") {
        if (v >= 1e8) return (v / 1e8).toFixed(1).replace(/\.0$/, "") + "\u4EBF";
        if (v >= 1e4) return (v / 1e4).toFixed(0) + "\u4E07";
        return String(v);
      }
      if (v >= 1e9) return (v / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
      if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
      if (v >= 1e3) return (v / 1e3).toFixed(0) + "K";
      return String(v);
    }
    function pctOf(v, total) {
      if (!total) return "0.0";
      return (v / total * 100).toFixed(1);
    }
    function niceCeil(v) {
      if (!(v > 0)) return 1;
      const p = Math.pow(10, Math.floor(Math.log10(v)));
      const d = v / p;
      const m = d <= 1 ? 1 : d <= 2 ? 2 : d <= 5 ? 5 : 10;
      return m * p;
    }
    function quartileThresholds(nonzero) {
      const sorted = [...nonzero].sort((a, b) => a - b);
      const q = (p) => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))] : Infinity;
      return { q1: q(0.25), q2: q(0.5), q3: q(0.75) };
    }
    function heatLevel(total, q) {
      if (total <= 0) return 0;
      return total <= q.q1 ? 1 : total <= q.q2 ? 2 : total <= q.q3 ? 3 : 4;
    }
    function dateLabel(key) {
      const p = key.split("-");
      return p[1] + "/" + p[2];
    }
    function dateCN(key, locale) {
      const p = key.split("-");
      const m = Number(p[1]);
      const d = Number(p[2]);
      return locale === "zh-CN" ? m + "\u6708" + d + "\u65E5" : m + "/" + d;
    }
    function weekdayIndexUTC(key) {
      return (parseDayKeyUTC(key).getUTCDay() + 6) % 7;
    }
    function formatClock(ts, locale) {
      const d = new Date(ts);
      const h = String(d.getUTCHours()).padStart(2, "0");
      const m = String(d.getUTCMinutes()).padStart(2, "0");
      return h + ":" + m + (locale === "zh-CN" ? "" : " UTC");
    }
    function pctFull(v) {
      return ((v || 0) * 100).toFixed(1);
    }

    // src/shared/contract.ts
    var RPC_CHANNEL = "/api";
    var RPC_OVERVIEW = "usage-stats/overview";
    var OVERVIEW_VERSION = 3;

    // src/client/api.ts
    var CACHE_KEY = "dsh-usage-panel:overview:v" + OVERVIEW_VERSION;
    function loadCached() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!isUsable(parsed)) return null;
        return parsed;
      } catch {
        return null;
      }
    }
    function saveCached(payload) {
      try {
        const record = { version: OVERVIEW_VERSION, savedAt: Date.now(), payload };
        localStorage.setItem(CACHE_KEY, JSON.stringify(record));
      } catch {
      }
    }
    function clearCached() {
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
      }
    }
    function isUsable(value) {
      if (!value || typeof value !== "object") return false;
      const v = value;
      if (v.version !== OVERVIEW_VERSION) return false;
      const payload = v.payload;
      if (!payload || typeof payload !== "object") return false;
      if (typeof payload.updatedAt !== "number") return false;
      const totals = payload.totals;
      if (!totals || typeof totals.input !== "number" || typeof totals.total !== "number") return false;
      if (!Array.isArray(payload.days) || !Array.isArray(payload.byModel)) return false;
      const allTime = payload.allTime;
      if (!allTime || typeof allTime.sessionCount !== "number") return false;
      const coverage = payload.coverage;
      if (!coverage || typeof coverage.sessionsTotal !== "number") return false;
      if (typeof coverage.usageSessionsMain !== "number" || typeof coverage.usageSessionsSubagent !== "number") return false;
      if (!Array.isArray(payload.topSessions) || !Array.isArray(payload.providers)) return false;
      return true;
    }
    async function callOverview(rpc, force) {
      const res = await rpc.call(RPC_CHANNEL, RPC_OVERVIEW, { force: !!force });
      if (res && res.ok) return res.value;
      const code = res && res.error ? res.error.code : "internal";
      const message = res && res.error ? res.error.message : "unknown error";
      const err = new Error(message);
      err.code = code;
      throw err;
    }

    // src/client/hooks.ts
    var import_react = require("react");
    var PALETTE = ["#4f8cff", "#22c55e", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16", "#e11d48", "#14b8a6"];
    function modelRows(byModel, otherLabel) {
      const rows = [];
      for (let i = 0; i < byModel.length && i < 5; i++) {
        const m = byModel[i];
        rows.push({
          model: m.model,
          total: m.total,
          color: PALETTE[i % PALETTE.length],
          rest: false,
          buckets: { input: m.input, output: m.output, cacheRead: m.cacheRead, cacheWrite: m.cacheWrite }
        });
      }
      if (byModel.length > 5) {
        const rest = byModel.slice(5);
        rows.push({
          model: otherLabel,
          total: rest.reduce((s, m) => s + m.total, 0),
          color: null,
          rest: true,
          buckets: rest.reduce(
            (acc, m) => ({
              input: acc.input + m.input,
              output: acc.output + m.output,
              cacheRead: acc.cacheRead + m.cacheRead,
              cacheWrite: acc.cacheWrite + m.cacheWrite
            }),
            { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
          )
        });
      }
      return rows;
    }
    function useCountUp(target, duration) {
      const [value, setValue] = (0, import_react.useState)(0);
      (0, import_react.useEffect)(() => {
        const start = performance.now();
        let raf = 0;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(target * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => {
          if (raf) cancelAnimationFrame(raf);
        };
      }, [target, duration]);
      return value;
    }
    function useI18n(i18n) {
      const subscribe = (0, import_react.useCallback)((cb) => i18n.subscribe(cb), [i18n]);
      const active = (0, import_react.useSyncExternalStore)(subscribe, i18n.getSnapshot, i18n.getSnapshot);
      return active === i18n.locale ? i18n : { ...i18n, locale: active };
    }
    function useLatest(value) {
      const ref = (0, import_react.useRef)(value);
      ref.current = value;
      return ref;
    }
    function useClickAway(onAway) {
      const ref = (0, import_react.useRef)(null);
      const cbRef = useLatest(onAway);
      const setRef = (0, import_react.useCallback)(
        (node) => {
          if (ref.current) document.removeEventListener("mousedown", handle);
          ref.current = node;
          if (node) document.addEventListener("mousedown", handle);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );
      function handle(e) {
        if (ref.current && !ref.current.contains(e.target)) cbRef.current();
      }
      (0, import_react.useEffect)(() => () => document.removeEventListener("mousedown", handle), []);
      return setRef;
    }

    // src/client/components/Tooltip.tsx
    var React = __toESM(require("react"), 1);
    function Tooltip({ tip }) {
      if (!tip) return null;
      return /* @__PURE__ */ React.createElement("div", { className: "dsw-ust-tooltip show", style: { left: tip.left, top: tip.top } }, /* @__PURE__ */ React.createElement("div", { className: "dsw-ust-tooltip-title" }, tip.title), tip.lines.map((l, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "dsw-ust-tooltip-row" }, /* @__PURE__ */ React.createElement("i", { style: { background: l.color || "var(--dsw-alias-label-secondary)" } }), /* @__PURE__ */ React.createElement("span", { className: "dsw-ust-tooltip-label" }, l.label), /* @__PURE__ */ React.createElement("span", { className: "dsw-ust-tooltip-value" }, l.value))));
    }

    // src/client/components/KpiCards.tsx
    var React2 = __toESM(require("react"), 1);
    function KpiCards({ overview, i18n }) {
      const t = i18n.t;
      const locale = i18n.locale;
      const allTime = overview.allTime || { totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }, sessionCount: 0, byModel: [] };
      const totals = allTime.totals || { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 };
      const total = totals.total || 0;
      const inputTotal = totals.input + totals.cacheRead + totals.cacheWrite;
      const top = allTime.byModel[0] || null;
      const rate = hitRate(totals);
      const coverage = overview.coverage;
      const animatedTotal = useCountUp(total, 900);
      const animatedInput = useCountUp(inputTotal, 900);
      const animatedOutput = useCountUp(totals.output, 900);
      const animatedSessions = useCountUp(allTime.sessionCount, 900);
      const animatedRate = useCountUp(rate === null ? 0 : rate * 100, 900);
      return /* @__PURE__ */ React2.createElement("div", { className: "dsw-ust-kpis" }, /* @__PURE__ */ React2.createElement("div", { className: "dsw-ust-kpi" }, /* @__PURE__ */ React2.createElement("div", { className: "l" }, t("kpi.total")), /* @__PURE__ */ React2.createElement("div", { className: "v" }, fmtTokens(animatedTotal, locale)), /* @__PURE__ */ React2.createElement("div", { className: "d" }, t("kpi.total.detail", { input: fmtTokens(animatedInput, locale), output: fmtTokens(animatedOutput, locale) }))), /* @__PURE__ */ React2.createElement("div", { className: "dsw-ust-kpi" }, /* @__PURE__ */ React2.createElement("div", { className: "l" }, t("kpi.sessions")), /* @__PURE__ */ React2.createElement("div", { className: "v" }, String(Math.round(animatedSessions))), /* @__PURE__ */ React2.createElement("div", { className: "d" }, t("kpi.sessions.detail", {
        total: coverage.sessionsTotal,
        main: coverage.usageSessionsMain,
        subagent: coverage.usageSessionsSubagent
      }))), /* @__PURE__ */ React2.createElement("div", { className: "dsw-ust-kpi" }, /* @__PURE__ */ React2.createElement("div", { className: "l" }, t("kpi.topModel")), /* @__PURE__ */ React2.createElement("div", { className: "v v-sm" }, top ? top.model : "\u2014"), /* @__PURE__ */ React2.createElement("div", { className: "d" }, top ? t("kpi.topModel.detail", { pct: pctOf(top.total, total) }) : "")), /* @__PURE__ */ React2.createElement("div", { className: "dsw-ust-kpi" }, /* @__PURE__ */ React2.createElement("div", { className: "l" }, t("kpi.hitRate")), /* @__PURE__ */ React2.createElement("div", { className: "v v-sm" }, rate === null ? "\u2014" : pctFull(animatedRate / 100) + "%"), /* @__PURE__ */ React2.createElement("div", { className: "d" }, rate === null ? t("kpi.hitRate.none") : t("kpi.hitRate.detail", { read: fmtTokens(totals.cacheRead, locale), write: fmtTokens(totals.cacheWrite, locale) }))));
    }

    // src/client/components/Heatmap.tsx
    var React3 = __toESM(require("react"), 1);
    function Heatmap({ days, i18n, onTip }) {
      const t = i18n.t;
      const locale = i18n.locale;
      const byDate = {};
      const nonzero = [];
      for (const d of days) {
        byDate[d.date] = d;
        if (d.total > 0) nonzero.push(d.total);
      }
      const q = quartileThresholds(nonzero);
      const levelOf = (total) => heatLevel(total, q);
      const firstDay = parseDayKeyUTC(days[0].date);
      const lead = weekdayIndexUTC(days[0].date);
      const heatWeeks = Math.ceil((lead + days.length) / 7);
      const monthLabels = [];
      const gridCells = [];
      let prevMonth = -1;
      for (let w = 0; w < heatWeeks; w++) {
        const monday = new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth(), firstDay.getUTCDate() - lead + w * 7));
        const m = monday.getUTCMonth();
        monthLabels.push(w === 0 || m !== prevMonth ? String(m + 1) + (locale === "zh-CN" ? "\u6708" : "/") : "");
        prevMonth = m;
        for (let r = 0; r < 7; r++) {
          const cur = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + r));
          const key = keyOfDateUTC(cur);
          const rec = byDate[key];
          if (!rec) {
            gridCells.push(/* @__PURE__ */ React3.createElement("div", { key: key + "-blank", className: "dsw-ust-heat-cell dsw-ust-heat-blank" }));
            continue;
          }
          const level = levelOf(rec.total);
          gridCells.push(
            /* @__PURE__ */ React3.createElement(
              "div",
              {
                key,
                className: "dsw-ust-heat-cell dsw-ust-h" + level,
                style: { animationDelay: (w * 0.018).toFixed(4) + "s" },
                onMouseEnter: (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  onTip({
                    left: rect.left + rect.width / 2,
                    top: rect.top - 6,
                    title: t("heat.day", { date: dateCN(key, locale), tokens: fmtTokens(rec.total, locale) }),
                    lines: []
                  });
                },
                onMouseLeave: () => onTip(null)
              }
            )
          );
        }
      }
      const weekdays = locale === "zh-CN" ? ["\u4E00", "", "\u4E09", "", "\u4E94", "", ""] : ["M", "", "W", "", "F", "", ""];
      const minWidth = heatWeeks * 12 + (heatWeeks - 1) * 3;
      return /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-card" }, /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-card-head" }, /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-card-title" }, /* @__PURE__ */ React3.createElement("h3", null, t("heat.title")), /* @__PURE__ */ React3.createElement("span", { className: "dsw-ust-card-sub" }, t("heat.sub"))), /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat-legend" }, /* @__PURE__ */ React3.createElement("span", null, t("heat.less")), [1, 2, 3, 4].map((l) => /* @__PURE__ */ React3.createElement("i", { key: l, className: "dsw-ust-heat-swatch dsw-ust-h" + l })), /* @__PURE__ */ React3.createElement("span", null, t("heat.more")))), /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat-wrap" }, /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat-weekdays" }, weekdays.map((w, i) => /* @__PURE__ */ React3.createElement("span", { key: i }, w))), /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat-main" }, /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat-months", style: { gridTemplateColumns: "repeat(" + heatWeeks + ", minmax(12px, 1fr))", minWidth } }, monthLabels.map((m, i) => /* @__PURE__ */ React3.createElement("span", { key: i, className: "dsw-ust-heat-month" }, m))), /* @__PURE__ */ React3.createElement("div", { className: "dsw-ust-heat", style: { gridTemplateColumns: "repeat(" + heatWeeks + ", minmax(12px, 1fr))", minWidth } }, gridCells))));
    }

    // src/client/components/BarChart.tsx
    var import_react2 = require("react");
    var React4 = __toESM(require("react"), 1);
    function BarChart({ days, byModel, i18n, onTip }) {
      const t = i18n.t;
      const locale = i18n.locale;
      const [range, setRange] = (0, import_react2.useState)(7);
      const rows = modelRows(byModel, t("donut.other"));
      const topNames = {};
      for (let i = 0; i < byModel.length && i < 5; i++) topNames[byModel[i].model] = true;
      const othersOf = (d) => {
        let s = 0;
        for (const name of Object.keys(d.models)) if (!topNames[name]) s += d.models[name].total;
        return s;
      };
      const rangeDays = days.slice(-range);
      const yMax = niceCeil(Math.max.apply(null, rangeDays.map((d) => d.total).concat(1)));
      const W = 720;
      const H = 230;
      const PL = 52;
      const PR = 12;
      const PT = 10;
      const PB = 26;
      const plotW = W - PL - PR;
      const plotH = H - PT - PB;
      const n = rangeDays.length;
      const band = plotW / n;
      const barW = Math.min(44, band * 0.6);
      const yLines = [];
      for (let i = 0; i <= 4; i++) {
        const v = yMax / 4 * i;
        const y = PT + plotH - v / yMax * plotH;
        yLines.push(
          /* @__PURE__ */ React4.createElement("g", { key: "y" + i }, /* @__PURE__ */ React4.createElement("line", { x1: PL, x2: W - PR, y1: y, y2: y, stroke: "var(--dsw-alias-border-l1)", strokeWidth: 1, strokeDasharray: i === 0 ? "none" : "3 3" }), /* @__PURE__ */ React4.createElement("text", { x: PL - 6, y: y + 3, textAnchor: "end", className: "dsw-ust-axis" }, fmtCompact(v, locale)))
        );
      }
      const bars = rangeDays.map((d, i) => {
        const x = PL + band * i + (band - barW) / 2;
        const segs = [];
        let acc = 0;
        for (const r of rows) {
          const v = r.rest ? othersOf(d) : d.models[r.model] ? d.models[r.model].total : 0;
          if (v > 0) {
            const h = v / yMax * plotH;
            segs.push(
              /* @__PURE__ */ React4.createElement(
                "rect",
                {
                  key: r.model,
                  x,
                  y: PT + plotH - acc - h,
                  width: barW,
                  height: h,
                  fill: r.rest ? "var(--dsw-alias-label-secondary)" : r.color,
                  opacity: r.rest ? 0.45 : 1,
                  rx: 2,
                  className: "dsw-ust-bar-seg",
                  style: { animationDelay: i * 30 + "ms" }
                }
              )
            );
            acc += h;
          }
        }
        if (acc === 0) {
          segs.push(
            /* @__PURE__ */ React4.createElement(
              "rect",
              {
                key: "zero",
                x,
                y: PT + plotH - 2,
                width: barW,
                height: 2,
                fill: "var(--dsw-alias-border-l2)",
                className: "dsw-ust-bar-seg",
                style: { animationDelay: i * 30 + "ms" }
              }
            )
          );
        }
        return /* @__PURE__ */ React4.createElement(
          "g",
          {
            key: d.date,
            className: "dsw-ust-bar-day",
            onMouseEnter: (e) => {
              const lines = [];
              let acc2 = 0;
              for (const r of rows) {
                const v = r.rest ? othersOf(d) : d.models[r.model] ? d.models[r.model].total : 0;
                if (v > 0) {
                  lines.push({ label: r.model, value: fmtTokens(v, locale) + " Tokens", color: r.rest ? "var(--dsw-alias-label-secondary)" : r.color });
                  acc2 += v;
                }
              }
              const rect = e.currentTarget.getBoundingClientRect();
              onTip({
                left: rect.left + rect.width / 2,
                top: rect.top - 6,
                title: t("bar.day", { date: dateCN(d.date, locale), tokens: fmtTokens(d.total || acc2, locale) }),
                lines
              });
            },
            onMouseLeave: () => onTip(null)
          },
          segs
        );
      });
      const xStep = n <= 7 ? 1 : Math.ceil(n / 7);
      const xLabels = rangeDays.map(
        (d, i) => i % xStep === 0 || i === n - 1 ? /* @__PURE__ */ React4.createElement("text", { key: d.date, x: PL + band * i + band / 2, y: H - 8, textAnchor: "middle", className: "dsw-ust-axis" }, dateLabel(d.date)) : null
      );
      return /* @__PURE__ */ React4.createElement("div", { className: "dsw-ust-card" }, /* @__PURE__ */ React4.createElement("div", { className: "dsw-ust-card-head" }, /* @__PURE__ */ React4.createElement("div", { className: "dsw-ust-card-title" }, /* @__PURE__ */ React4.createElement("h3", null, t("bar.title")), /* @__PURE__ */ React4.createElement("span", { className: "dsw-ust-card-sub" }, t("bar.sub"))), /* @__PURE__ */ React4.createElement("div", { className: "dsw-ust-range" }, [7, 14, 30].map((r) => /* @__PURE__ */ React4.createElement("button", { key: r, className: range === r ? "on" : "", onClick: () => setRange(r) }, r + "d")))), /* @__PURE__ */ React4.createElement("svg", { viewBox: "0 0 720 230", className: "dsw-ust-chart", preserveAspectRatio: "xMidYMid meet" }, yLines, bars, xLabels), /* @__PURE__ */ React4.createElement("div", { className: "dsw-ust-legend" }, rows.map((r) => /* @__PURE__ */ React4.createElement("span", { key: r.model, className: "dsw-ust-legend-item" }, /* @__PURE__ */ React4.createElement("i", { style: { background: r.rest ? "var(--dsw-alias-label-secondary)" : r.color, opacity: r.rest ? 0.45 : 1 } }), r.model))));
    }

    // src/client/components/SessionsCard.tsx
    var React5 = __toESM(require("react"), 1);
    function SessionsCard({ sessions, i18n }) {
      const t = i18n.t;
      const locale = i18n.locale;
      if (!sessions.length) return /* @__PURE__ */ React5.createElement("div", null);
      return /* @__PURE__ */ React5.createElement("div", { className: "dsw-ust-card" }, /* @__PURE__ */ React5.createElement("div", { className: "dsw-ust-card-head" }, /* @__PURE__ */ React5.createElement("div", { className: "dsw-ust-card-title" }, /* @__PURE__ */ React5.createElement("h3", null, t("sessions.title")), /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-card-sub" }, t("sessions.sub")))), sessions.map((s, i) => {
        const d = new Date(s.lastActive);
        const date = d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
        return /* @__PURE__ */ React5.createElement("div", { key: s.id, className: "dsw-ust-srow" }, /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-srank" }, i + 1), /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-sname", title: s.id }, s.title || t("sessions.untitled")), /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-stag" + (s.depth > 0 ? " sub" : "") }, s.depth > 0 ? t("sessions.subagent") : t("sessions.main")), /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-smeta" }, date), /* @__PURE__ */ React5.createElement("span", { className: "dsw-ust-stokens" }, fmtTokens(s.totals.total, locale)));
      }));
    }

    // src/client/components/ProvidersCard.tsx
    var React6 = __toESM(require("react"), 1);
    function ProvidersCard({ providers, i18n }) {
      const locale = i18n.locale;
      if (!providers.length) return null;
      if (providers.length === 1 && (providers[0].id === "unknown" || providers[0].totals.total <= 0)) return null;
      if (providers.length === 1 && providers[0].id === "unknown") return null;
      const top = Math.max(1, providers[0].totals.total);
      return /* @__PURE__ */ React6.createElement("div", { className: "dsw-ust-card" }, /* @__PURE__ */ React6.createElement("h3", null, i18n.t("providers.title")), providers.map((p) => /* @__PURE__ */ React6.createElement("div", { key: p.id, className: "dsw-ust-prow" }, /* @__PURE__ */ React6.createElement("span", { className: "dsw-ust-pname", title: p.id }, p.name), /* @__PURE__ */ React6.createElement("div", { className: "dsw-ust-pbar" }, /* @__PURE__ */ React6.createElement("i", { style: { width: Math.max(2, Math.round(p.totals.total / top * 100)) + "%", background: "#4f8cff" } })), /* @__PURE__ */ React6.createElement("span", { className: "dsw-ust-ptokens" }, fmtTokens(p.totals.total, locale)))));
    }

    // src/client/components/ModelDonut.tsx
    var React7 = __toESM(require("react"), 1);
    function ModelDonut({ byModel, total, i18n, onTip }) {
      const t = i18n.t;
      const locale = i18n.locale;
      const rows = modelRows(byModel, t("donut.other"));
      const R = 70;
      const C = 2 * Math.PI * R;
      const segs = [];
      let acc = 0;
      for (const r of rows) {
        const frac = total ? r.total / total : 0;
        if (frac <= 0) continue;
        const len = frac * C;
        const rate = hitRate(r.buckets);
        segs.push(
          /* @__PURE__ */ React7.createElement(
            "circle",
            {
              key: r.model,
              cx: 90,
              cy: 90,
              r: R,
              fill: "none",
              className: "dsw-ust-donut-seg",
              stroke: r.rest ? "var(--dsw-alias-label-secondary)" : r.color,
              strokeOpacity: r.rest ? 0.45 : 1,
              strokeWidth: 24,
              strokeDasharray: len + " " + (C - len),
              strokeDashoffset: -acc,
              onMouseEnter: (e) => {
                onTip({
                  left: e.clientX,
                  top: e.clientY - 6,
                  title: r.model,
                  lines: [
                    { label: t("unit.tokens", { n: "" }).trim() || "Tokens", value: fmtTokens(r.total, locale) },
                    { label: t("donut.share"), value: pctOf(r.total, total) + "%", color: r.rest ? "var(--dsw-alias-label-secondary)" : r.color },
                    { label: t("donut.hitRate"), value: rate === null ? "\u2014" : pctFull(rate) + "%" }
                  ]
                });
              },
              onMouseLeave: () => onTip(null)
            }
          )
        );
        acc += len;
      }
      const listRows = rows.map((r) => {
        const rate = hitRate(r.buckets);
        return /* @__PURE__ */ React7.createElement("div", { key: r.model, className: "dsw-ust-mrow" }, /* @__PURE__ */ React7.createElement("i", { className: "dsw-ust-dot", style: { background: r.rest ? "var(--dsw-alias-label-secondary)" : r.color, opacity: r.rest ? 0.45 : 1 } }), /* @__PURE__ */ React7.createElement("span", { className: "dsw-ust-mname", title: r.model }, r.model), /* @__PURE__ */ React7.createElement("span", { className: "dsw-ust-mtokens" }, fmtTokens(r.total, locale)), /* @__PURE__ */ React7.createElement("span", { className: "dsw-ust-mpct" }, pctOf(r.total, total) + "%"), /* @__PURE__ */ React7.createElement("span", { className: "dsw-ust-mrate" }, rate === null ? "\u2014" : pctFull(rate) + "%"));
      });
      return /* @__PURE__ */ React7.createElement("div", { className: "dsw-ust-card" }, /* @__PURE__ */ React7.createElement("h3", null, t("donut.title")), /* @__PURE__ */ React7.createElement("div", { className: "dsw-ust-models" }, /* @__PURE__ */ React7.createElement("div", { className: "dsw-ust-donut" }, /* @__PURE__ */ React7.createElement("svg", { width: 180, height: 180, viewBox: "0 0 180 180" }, /* @__PURE__ */ React7.createElement("circle", { cx: 90, cy: 90, r: R, fill: "none", stroke: "var(--dsw-alias-bg-layer-2)", strokeWidth: 24 }), segs, /* @__PURE__ */ React7.createElement("text", { x: 90, y: 86, textAnchor: "middle", className: "dsw-ust-donut-total" }, fmtTokens(total, locale)), /* @__PURE__ */ React7.createElement("text", { x: 90, y: 106, textAnchor: "middle", className: "dsw-ust-donut-cap" }, t("donut.cap")))), /* @__PURE__ */ React7.createElement("div", { className: "dsw-ust-mlist" }, /* @__PURE__ */ React7.createElement("div", { className: "dsw-ust-mhead" }, /* @__PURE__ */ React7.createElement("span", { style: { width: 18, flexShrink: 0 } }), /* @__PURE__ */ React7.createElement("span", { className: "h-model" }, t("donut.model")), /* @__PURE__ */ React7.createElement("span", null, t("donut.tokens")), /* @__PURE__ */ React7.createElement("span", { className: "h-share" }, t("donut.share")), /* @__PURE__ */ React7.createElement("span", { className: "h-rate" }, t("donut.hitRate"))), listRows)));
    }

    // src/client/components/ExportMenu.tsx
    var import_react3 = require("react");

    // src/client/export.ts
    function csvCell(value) {
      let text = String(value);
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      if (/[",\n\r]/.test(text)) text = '"' + text.replace(/"/g, '""') + '"';
      return text;
    }
    function buildDailyCsv(days) {
      const rows = ["date,total,input,output,cacheRead,cacheWrite"];
      for (const d of days) {
        if (d.total <= 0) continue;
        let input = 0;
        let output = 0;
        let cacheRead = 0;
        let cacheWrite = 0;
        for (const model of Object.keys(d.models)) {
          const m = d.models[model];
          input += m.input;
          output += m.output;
          cacheRead += m.cacheRead;
          cacheWrite += m.cacheWrite;
        }
        rows.push(
          [csvCell(d.date), csvCell(d.total), csvCell(input), csvCell(output), csvCell(cacheRead), csvCell(cacheWrite)].join(",")
        );
      }
      return "\uFEFF" + rows.join("\n");
    }
    function buildModelCsv(byModel) {
      const rows = ["model,total,input,output,cacheRead,cacheWrite"];
      for (const m of byModel) {
        rows.push([csvCell(m.model), csvCell(m.total), csvCell(m.input), csvCell(m.output), csvCell(m.cacheRead), csvCell(m.cacheWrite)].join(","));
      }
      return "\uFEFF" + rows.join("\n");
    }
    function buildJson(overview) {
      return JSON.stringify(overview, null, 2);
    }
    function download(filename, content, mime) {
      const blob = new Blob([content], { type: mime + ";charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }

    // src/client/components/ExportMenu.tsx
    var React8 = __toESM(require("react"), 1);
    function ExportMenu({ overview, i18n }) {
      const t = i18n.t;
      const [open, setOpen] = (0, import_react3.useState)(false);
      const menuRef = useClickAway(() => setOpen(false));
      const run = (kind) => {
        if (kind === "json") download(t("export.file.json"), buildJson(overview), "application/json");
        else if (kind === "daily") download(t("export.file.daily"), buildDailyCsv(overview.days), "text/csv");
        else download(t("export.file.models"), buildModelCsv(overview.byModel), "text/csv");
        setOpen(false);
      };
      return /* @__PURE__ */ React8.createElement("div", { className: "dsw-ust-export", ref: menuRef }, /* @__PURE__ */ React8.createElement("button", { className: "dsw-ust-refresh", onClick: () => setOpen((v) => !v) }, t("export.button")), open ? /* @__PURE__ */ React8.createElement("div", { className: "dsw-ust-export-menu" }, /* @__PURE__ */ React8.createElement("button", { onClick: () => run("json") }, t("export.json")), /* @__PURE__ */ React8.createElement("button", { onClick: () => run("daily") }, t("export.daily")), /* @__PURE__ */ React8.createElement("button", { onClick: () => run("models") }, t("export.models"))) : null);
    }

    // src/client/StatsSection.tsx
    var React9 = __toESM(require("react"), 1);
    function StatsSection({ rpc, i18n: baseI18n }) {
      const i18n = useI18n(baseI18n);
      const t = i18n.t;
      const locale = i18n.locale;
      const [data, setData] = (0, import_react4.useState)(null);
      const [loading, setLoading] = (0, import_react4.useState)(false);
      const [error, setError] = (0, import_react4.useState)(null);
      const [freshness, setFreshness] = (0, import_react4.useState)("loading");
      const [barTip, setBarTip] = (0, import_react4.useState)(null);
      const [donutTip, setDonutTip] = (0, import_react4.useState)(null);
      const [heatTip, setHeatTip] = (0, import_react4.useState)(null);
      const dataRef = useLatest(data);
      const load = (0, import_react4.useCallback)(
        (force) => {
          setLoading(true);
          setError(null);
          callOverview(rpc, force).then((res) => {
            setData(res);
            setFreshness(res.stale ? "stale" : "fresh");
            saveCached(res);
          }).catch((err) => {
            const msg = String(err?.message ?? err);
            setError(msg);
            setFreshness(dataRef.current ? "fallback" : "error");
          }).then(() => setLoading(false));
        },
        [rpc]
      );
      (0, import_react4.useEffect)(() => {
        const cached = loadCached();
        if (cached) {
          setData(cached.payload);
          setFreshness("fresh");
        }
        load(false);
      }, [load]);
      const allTime = data && data.allTime || { totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }, sessionCount: 0, byModel: [] };
      const allTimeTotal = allTime.totals.total || 0;
      const recentByModel = data && data.byModel || [];
      const days = data && data.days || [];
      let subText = null;
      if (!data && !error) subText = t("status.loading");
      else if (data) {
        const time = formatClock(data.updatedAt || Date.now(), locale);
        if (freshness === "stale") subText = t("status.stale", { time });
        else if (freshness === "fallback") subText = t("status.fallback", { time });
        else subText = t("status.fresh", { time });
      } else if (error) {
        subText = t("status.error", { msg: error });
      }
      let body;
      if (!data && !error) {
        body = /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-empty" }, /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-empty-title" }, t("status.loading")), /* @__PURE__ */ React9.createElement("div", null, t("status.loading.hint")));
      } else if (error && !data) {
        body = /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-empty" }, t("status.error", { msg: error }));
      } else if (allTimeTotal === 0 && data?.coverage.sessionsTotal === 0) {
        body = /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-empty" }, /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-empty-title" }, t("empty.title")), /* @__PURE__ */ React9.createElement("div", null, t("empty.hint")));
      } else {
        const overview = data;
        body = /* @__PURE__ */ React9.createElement(React9.Fragment, null, /* @__PURE__ */ React9.createElement(KpiCards, { overview, i18n }), /* @__PURE__ */ React9.createElement(Heatmap, { days, i18n, onTip: setHeatTip }), /* @__PURE__ */ React9.createElement(BarChart, { days, byModel: recentByModel, i18n, onTip: setBarTip }), /* @__PURE__ */ React9.createElement(SessionsCard, { sessions: overview.topSessions, i18n }), /* @__PURE__ */ React9.createElement(ProvidersCard, { providers: overview.providers, i18n }), /* @__PURE__ */ React9.createElement(ModelDonut, { byModel: allTime.byModel, total: allTimeTotal, i18n, onTip: setDonutTip }));
      }
      return /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-root" }, /* @__PURE__ */ React9.createElement(Tooltip, { tip: barTip }), /* @__PURE__ */ React9.createElement(Tooltip, { tip: donutTip }), /* @__PURE__ */ React9.createElement(Tooltip, { tip: heatTip }), /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-head" }, /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-head-title" }, /* @__PURE__ */ React9.createElement("svg", { className: "dsw-ust-page-icon", width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", "aria-hidden": "true" }, /* @__PURE__ */ React9.createElement("path", { d: "M3 13V9.5" }), /* @__PURE__ */ React9.createElement("path", { d: "M8 13V5.5" }), /* @__PURE__ */ React9.createElement("path", { d: "M13 13V3" }), /* @__PURE__ */ React9.createElement("path", { d: "M2 13.5h12" })), /* @__PURE__ */ React9.createElement("div", null, /* @__PURE__ */ React9.createElement("h2", null, t("nav.label")), subText ? /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-sub" }, subText) : null)), /* @__PURE__ */ React9.createElement("div", { className: "dsw-ust-head-actions" }, data ? /* @__PURE__ */ React9.createElement(ExportMenu, { overview: data, i18n }) : null, /* @__PURE__ */ React9.createElement(
        "button",
        {
          className: "dsw-ust-refresh",
          onClick: () => load(true),
          disabled: loading,
          title: t("refresh.title")
        },
        /* @__PURE__ */ React9.createElement("svg", { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React9.createElement("path", { d: "M21 12a9 9 0 1 1-2.64-6.36" }), /* @__PURE__ */ React9.createElement("polyline", { points: "21 3 21 9 15 9" })),
        loading ? t("refresh.loading") : t("refresh.button")
      ))), body);
    }

    // src/client/boundary.tsx
    var import_react5 = require("react");
    var React10 = __toESM(require("react"), 1);
    var Boundary = class extends import_react5.Component {
      state = { error: null };
      static getDerivedStateFromError(err) {
        return { error: String(err?.message ?? err) };
      }
      componentDidCatch(err) {
        console.error("[dsh-usage-panel] render crashed:", err);
      }
      reset = () => {
        clearCached();
        this.setState({ error: null });
      };
      render() {
        const t = this.props.i18n.t;
        if (this.state.error !== null) {
          return /* @__PURE__ */ React10.createElement("div", { className: "dsw-ust-empty" }, /* @__PURE__ */ React10.createElement("div", { className: "dsw-ust-empty-title" }, t("error.title")), /* @__PURE__ */ React10.createElement("div", { style: { margin: "6px 0 12px" } }, t("error.detail", { msg: this.state.error })), /* @__PURE__ */ React10.createElement("button", { className: "dsw-ust-refresh", onClick: this.reset }, t("error.reset")));
        }
        return this.props.children;
      }
    };

    // src/client/index.tsx
    var inject = ["slots", "connection", "locale"];
    function apply(ctx) {
      let tag = null;
      if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + STYLE_ID + '"]') === null) {
        tag = document.createElement("style");
        tag.dataset.plugin = "dsh-usage-panel";
        tag.dataset.pluginCss = STYLE_ID;
        tag.textContent = CSS;
        document.head.appendChild(tag);
      }
      const i18n = createI18n(ctx.locale);
      const disposeLocaleEvent = ctx.on ? ctx.on("locale/change", () => i18n.update()) : null;
      const slots = ctx.slots;
      slots.inject(
        "settings.section",
        () => slots.register(
          {
            name: "settings.section",
            id: "usage-stats",
            order: 25,
            label: () => i18n.t("nav.label")
          },
          () => (0, import_react6.createElement)(Boundary, { i18n }, (0, import_react6.createElement)(StatsSection, { rpc: ctx.connection.rpc, i18n }))
        )
      );
      ctx.effect(() => () => {
        if (tag !== null && tag.isConnected) tag.remove();
        if (disposeLocaleEvent) disposeLocaleEvent();
        i18n.dispose();
      });
    }

    return module.exports
  }
})
