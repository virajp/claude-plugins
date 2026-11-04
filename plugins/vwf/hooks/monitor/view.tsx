import type {
  ElementTable,
  RenderChildren,
} from "claude-code";

import type {
  AgentRun,
  PlanRun,
  QueueRow,
  ReplayUnit,
} from "../../types";
import {
  nameOf,
  time,
} from "./plan";

/** The elements of every surface that the two views draw with. */
type Ui = Pick<ElementTable, "Box" | "Text" | "Button">;
/** A graphical surface's elements: each one also has Svg. */
type GraphicUi = Pick<ElementTable<"desktop">, "Box" | "Text" | "Button" | "Svg">;

const FINISHED = ["green", "skipped"];

const FILL: Record<string, string> = {
  red: "#d9534f",
  gray: "#8a8f98",
  green: "#3fa66a",
  yellow: "#d9a520",
  blue: "#4a90d9",
};
// The same colors as a pill's tint: the color at 15% over the pane.
const TINT = (color: string) => `${color}26`;
const PENDING = "#8a8f98";
const NOW_LINE = "#c9ccd1";

// A drawing's own units. The markup stretches across its slot at a fixed pixel
// height, so a corner's x radius is larger than its y radius.
const SVG_WIDTH = 2000;
const BAR_HEIGHT = 8;
const TRACK_HEIGHT = 12;

function clock(ms: number | undefined): string {
  if (ms === undefined) {
    return "—";
  }
  const d = new Date(ms);

  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function span(from: number | undefined, to: number | undefined): string {
  if (from === undefined || to === undefined) {
    return "—";
  }
  const minutes = Math.round((to - from) / 60000);

  return minutes < 60
    ? `${minutes}m`
    : `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, "0")}`;
}

function fit(text: string, width: number): string {
  return text.length <= width
    ? text.padEnd(width)
    : text.slice(0, Math.max(0, width - 1)) + "…";
}

const readTime = (at: number | undefined) => at === undefined ? "—" : new Date(at).toTimeString().slice(0, 8);

/** A status's name in the color map: red, gray, green, yellow, blue, or none. */
function colorName(status: string, gaps = 0): string | undefined {
  if (/fail|unresolved|BLOCKED/.test(status)) {
    return "red";
  }
  if (status === "skipped") {
    return "gray";
  }
  if (status === "green" || status === "COMPLETE") {
    return gaps > 0 ? "yellow" : "green";
  }
  if (status === "running" || status === "RUNNING") {
    return "blue";
  }

  return undefined;
}

const fillOf = (status: string, gaps = 0) => FILL[colorName(status, gaps) ?? ""] ?? PENDING;

/** One rounded rectangle of a drawing, in its own units. */
function rect(
  x: number,
  width: number,
  height: number,
  fill: string,
  options: { rx?: number; opacity?: number } = {},
): string {
  const opacity = options.opacity === undefined ? "" : ` fill-opacity="${options.opacity}"`;

  return `<rect x="${x.toFixed(1)}" y="0" width="${Math.max(0, width).toFixed(1)}" height="${height}" rx="${
    options.rx ?? 12
  }" ry="${Math.min(3, height / 2)}" fill="${fill}"${opacity}/>`;
}

/** A drawing that fills its slot's width at a fixed height. */
function svgOf(height: number, shapes: string[]): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${height}" viewBox="0 0 ${SVG_WIDTH} ${height}" preserveAspectRatio="none">${
    shapes.join("")
  }</svg>`;
}

/** The progress bar: one segment for each unit. */
function segmentsSvg(fills: string[]): string {
  const gap = 10;
  const count = Math.max(1, fills.length);
  const size = (SVG_WIDTH - gap * (count - 1)) / count;

  return svgOf(
    BAR_HEIGHT,
    fills.map((fill, i) => rect(i * (size + gap), size, BAR_HEIGHT, fill, fill === PENDING ? { opacity: 0.35 } : {})),
  );
}

/** One track of the shared axis: the track, its bar and the now line. */
function trackSvg(
  axis: { from: number; to: number } | undefined,
  bar: { from: number; to: number; fill: string } | undefined,
  nowAt: number | undefined,
): string {
  const shapes = [rect(0, SVG_WIDTH, TRACK_HEIGHT, PENDING, { opacity: 0.15 })];
  if (axis !== undefined) {
    const size = Math.max(1, axis.to - axis.from);
    const at = (ms: number) => Math.min(1, Math.max(0, (ms - axis.from) / size)) * SVG_WIDTH;
    if (bar !== undefined) {
      shapes.push(
        rect(at(bar.from), Math.max(16, at(bar.to) - at(bar.from)), TRACK_HEIGHT, bar.fill),
      );
    }
    if (nowAt !== undefined) {
      shapes.push(rect(Math.min(SVG_WIDTH - 10, at(nowAt)), 10, TRACK_HEIGHT, NOW_LINE, { rx: 0 }));
    }
  }

  return svgOf(TRACK_HEIGHT, shapes);
}

/** A small rounded label with a tinted background. */
function pill(ui: Ui, key: string, text: string, color: string | undefined) {
  const { Box, Text } = ui;
  const hue = color === undefined ? PENDING : FILL[color] ?? PENDING;

  return (
    <Box
      key={key}
      flexShrink={0}
      borderStyle="round"
      borderColor={TINT(hue)}
      backgroundColor={TINT(hue)}
      paddingX="sm"
    >
      <Text size="caption" color={hue}>{text}</Text>
    </Box>
  );
}

export type Timeline = {
  plan: PlanRun;
  now: number;
  /** Each unit's status as drawn: pending with a live agent reads running. */
  shown: string[];
  gapCounts: number[];
  isClaiming: boolean;
  readAt?: number | undefined;
  problem?: string | undefined;
  isLive: boolean;
  isQuiet: boolean;
  isMainView: boolean;
  close: () => unknown;
  back: () => unknown;
  plans: () => unknown;
  toggleQuiet: () => unknown;
  show: (label: string, agent: AgentRun | undefined) => unknown;
};

/** The badge of a plan: its words and its color. */
function badgeOf(plan: PlanRun, isClaiming: boolean): { text: string; color: string } {
  const state = plan.replay.state;
  if (isClaiming) {
    return { text: "APPROVED · claim in progress", color: "blue" };
  }
  if (plan.phase === "not-run") {
    return { text: `${plan.row.status} · not run`, color: "yellow" };
  }
  if (state === "BLOCKED") {
    return { text: "BLOCKED", color: "red" };
  }
  if (plan.phase === "ended") {
    return { text: "COMPLETE", color: "green" };
  }

  return plan.phase === "paused"
    ? { text: "RUNNING · paused or stopped", color: "yellow" }
    : { text: "RUNNING · live", color: "blue" };
}

/** The state card's text, if the state has one. */
function messageOf(p: Timeline): string | undefined {
  const { plan, isClaiming } = p;
  const state = plan.replay;
  if (isClaiming) {
    return "/vwf:execute has started. The claim will set this plan to RUNNING. These details come from index.json.";
  }
  if (plan.phase === "not-run") {
    const required = plan.row.requires.join(", ");

    return `This plan did not run. Times will show after the claim. Priority ${plan.row.priority}.${
      required ? ` Requires ${required}.` : ""
    }`;
  }
  if (plan.phase === "paused") {
    return `No activity for 10 minutes. ${state.detail}`.trim();
  }
  if (state.state === "BLOCKED") {
    return state.detail || "The run stopped.";
  }
  if (plan.phase === "ended") {
    return state.detail || `The plan ended at ${clock(time(plan.row.ended))}.`;
  }

  return undefined;
}

/** Where the state came from, in the footer's words. */
function sourceOf(plan: PlanRun): string {
  if (plan.statePath.includes("/.worktrees/")) {
    return "worktree copy";
  }

  return plan.statePath.includes("/archived/") ? "archived copy" : "main copy";
}

/** The desktop, VS Code and mobile view of one plan: the approved timeline. */
export function drawTimeline(ui: GraphicUi, p: Timeline) {
  const { Box, Text, Button, Svg } = ui;
  const { plan, now, shown, gapCounts } = p;
  const state = plan.replay;
  const name = nameOf(plan.folder);
  const units = state.units;
  const isEnded = plan.phase === "ended";
  const done = shown.filter((one) => FINISHED.includes(one)).length;
  const startedAt = time(plan.row.started);
  const endedAt = time(plan.row.ended);
  const badge = badgeOf(plan, p.isClaiming);
  const message = messageOf(p);

  // The axis runs from the first start to the last end, or to now while not ended.
  const dated = [
    ...units,
    ...state.waves,
    ...state.stages,
  ];
  const starts = dated
    .map((one) => time(one.started))
    .filter((one): one is number => one !== undefined);
  const ends = dated
    .map((one) => time(one.ended))
    .filter((one): one is number => one !== undefined);
  const from = Math.min(startedAt ?? Infinity, ...starts);
  const to = isEnded
    ? Math.max(endedAt ?? -Infinity, ...ends, ...starts)
    : now;
  const hasAxis = Number.isFinite(from) && Number.isFinite(to) && to > from;
  const axis = hasAxis ? { from, to } : undefined;
  const nowLine = !isEnded && hasAxis ? now : undefined;

  const barOf = (started: string, ended: string, status: string, gaps = 0) => {
    const s = time(started);
    if (s === undefined || !hasAxis) {
      return undefined;
    }

    return { from: s, to: time(ended) ?? (isEnded ? s : now), fill: fillOf(status, gaps) };
  };
  const duration = (started: string, ended: string) =>
    span(
      time(started),
      time(ended) ?? (time(started) !== undefined && !isEnded ? now : undefined),
    );
  // Percent widths, so that the drawing's own width cannot widen its row.
  const LABEL = "36%";
  const TRACK = "54%";
  const TOOK = "10%";
  const row = (
    key: string,
    label: RenderChildren,
    bar: ReturnType<typeof barOf>,
    took: string,
    alt: string,
  ) => (
    <Box key={key} flexDirection="row" alignItems="center" hover={{ backgroundColor: TINT(PENDING) }}>
      <Box width={LABEL} flexShrink={0} flexDirection="row" alignItems="center" gap="xs" overflow="hidden">
        {label}
      </Box>
      <Box width={TRACK} flexShrink={0} overflow="hidden">
        <Svg source={trackSvg(axis, bar, nowLine)} alt={alt} height={TRACK_HEIGHT} />
      </Box>
      <Box width={TOOK} flexShrink={0} justifyContent="flex-end">
        <Text dimColor tabular size="caption">{took}</Text>
      </Box>
    </Box>
  );
  const reviewLabel = (key: string, agent: AgentRun) => [
    <Button
      key={`review-${key}`}
      plain
      label={key}
      onPress={() => p.show(key, agent)}
    />,
    <Text key="title" wrap="truncate" size="footnote" dimColor>
      {agent.live ? "review, running" : "review, done"}
    </Text>,
  ];
  const reviewRow = (key: string, agent: AgentRun) =>
    row(
      `row-review-${key}`,
      reviewLabel(key, agent),
      undefined,
      "—",
      `${key} has no time on the axis`,
    );
  const unitRow = (unit: ReplayUnit) => {
    const i = units.indexOf(unit);
    const one = shown[i] ?? "pending";
    const gaps = gapCounts[i] ?? 0;
    const took = duration(unit.started, one === "running" ? "" : unit.ended);

    return row(
      `row-${unit.id}`,
      [
        <Button
          key={`unit-${unit.id}`}
          plain
          label={unit.id}
          onPress={() => p.show(unit.id, unit.agent)}
        />,
        <Text key="title" wrap="truncate" size="footnote" dimColor={one === "pending"}>
          {unit.title}
        </Text>,
      ],
      barOf(unit.started, one === "running" ? "" : unit.ended, one, gaps),
      took,
      `${unit.id} ${one}, ${took}`,
    );
  };
  const waves = [...new Set(units.map((unit) => unit.wave))].sort((a, b) => a - b);
  const stages = state.stages.filter((one) => one.state !== "skipped" && one.state !== "pending");
  const running = units.filter((_, i) => shown[i] === "running");
  // A live plan with no running unit is in a wave's review and gates.
  const activeWave = plan.phase === "live" && running.length === 0
    ? state.waves.find((wave) => wave.status === "running")
    : undefined;
  const isWaveReview = (key: string, wave: number) => key === `R${wave}` || key === `R${wave}-late`;
  const card = (key: string, children: RenderChildren, color: string) => (
    <Box
      key={key}
      flexDirection="column"
      borderStyle="round"
      borderColor={color}
      backgroundColor={TINT(color)}
      paddingX="sm"
      paddingY="xs"
    >
      {children}
    </Box>
  );

  return (
    <Box flexDirection="column" gap="sm">
      <Box flexDirection="row" justifyContent="space-between" gap="sm">
        <Box flexDirection="column" flexShrink={1}>
          <Text size="heading" weight="medium">{state.title || name}</Text>
          <Text mono dimColor size="caption">
            {plan.row.kind ? `${name} · ${plan.row.kind} plan` : name}
          </Text>
        </Box>
        {pill(ui, "badge", badge.text, badge.color)}
      </Box>

      <Box flexDirection="column" gap="xs">
        <Box flexDirection="row" justifyContent="space-between" gap="sm">
          <Text size="footnote" dimColor>{`${done} of ${units.length} units`}</Text>
          <Text size="footnote" dimColor tabular>
            {`Started ${clock(startedAt)} · Elapsed ${
              span(startedAt, endedAt ?? (isEnded || startedAt === undefined ? undefined : now))
            }${endedAt === undefined ? "" : ` · Ended ${clock(endedAt)}`}`}
          </Text>
        </Box>
        <Box width="100%" overflow="hidden">
          <Svg
            source={segmentsSvg(units.map((_, i) => fillOf(shown[i] ?? "pending", gapCounts[i] ?? 0)))}
            alt={`${done} of ${units.length} units finished`}
            height={BAR_HEIGHT}
          />
        </Box>
      </Box>

      {state.noData && !isEnded && plan.phase !== "not-run" && <Text dimColor size="footnote">no run data yet</Text>}

      {message !== undefined && card("message", <Text size="footnote">{message}</Text>, FILL[badge.color] ?? PENDING)}

      {(running.length > 0 || activeWave !== undefined)
        && card(
          "now",
          [
            <Text key="now-head" dimColor size="caption">Now</Text>,
            ...running.map((unit) => (
              <Box key={`now-${unit.id}`} flexDirection="column">
                <Text size="footnote" weight="medium">{`${unit.id} · ${unit.title}`}</Text>
                <Text dimColor size="caption">
                  {[
                    unit.agent?.type.replace(/^vwf:/, ""),
                    unit.rounds > 0 ? `round ${unit.rounds}` : undefined,
                    `running ${duration(unit.started, "")}`,
                    `wave ${unit.wave}`,
                  ]
                    .filter((one) => one !== undefined)
                    .join(" · ")}
                </Text>
              </Box>
            )),
            ...(activeWave === undefined ? [] : [
              <Box key="now-wave" flexDirection="column">
                <Text size="footnote" weight="medium">
                  {`Wave ${activeWave.id.replace(/^W/, "")} · review and gates`}
                </Text>
                <Text dimColor size="caption">
                  {`every unit of the wave has finished · running ${duration(activeWave.started, "")}`}
                </Text>
              </Box>,
            ]),
          ],
          FILL["blue"]!,
        )}

      <Box flexDirection="column" gap="xs">
        {hasAxis && (
          <Box flexDirection="row">
            <Box width={LABEL} flexShrink={0} />
            <Box width={TRACK} flexShrink={0} flexDirection="row" justifyContent="space-between">
              <Text dimColor size="caption" tabular>{clock(from)}</Text>
              <Text dimColor size="caption" tabular>{clock(from + (to - from) / 2)}</Text>
              <Text dimColor size="caption" tabular>{clock(to)}</Text>
            </Box>
          </Box>
        )}
        {waves.map((wave) => {
          const entry = state.waves.find((one) => one.id === `W${wave}`);

          return (
            <Box key={`wave-${wave}`} flexDirection="column">
              <Box flexDirection="row" gap="xs" alignItems="center">
                <Text size="caption" weight="medium">{`Wave ${wave}`}</Text>
                {entry !== undefined && entry.status !== "pending" && entry.status !== "green" && (
                  <Text
                    size="caption"
                    color={fillOf(entry.status)}
                  >
                    {entry.status}
                  </Text>
                )}
              </Box>
              {units.filter((unit) => unit.wave === wave).map(unitRow)}
              {Object
                .entries(state.reviews)
                .filter(([key]) => isWaveReview(key, wave))
                .map(([key, agent]) => reviewRow(key, agent))}
            </Box>
          );
        })}
        {Object
          .entries(state.reviews)
          .filter(([key]) => !waves.some((wave) => isWaveReview(key, wave)))
          .map(([key, agent]) => reviewRow(key, agent))}
        {stages.length > 0 && (
          <Box flexDirection="column">
            <Text size="caption" weight="medium">Final stages</Text>
            {stages.map((stage) =>
              row(
                `row-stage-${stage.name}`,
                <Text wrap="truncate" size="footnote">{stage.name}</Text>,
                barOf(stage.started, stage.ended, stage.state),
                duration(stage.started, stage.ended),
                `${stage.name} ${stage.state}`,
              )
            )}
          </Box>
        )}
      </Box>

      {state.gaps.length > 0 && (
        <Box flexDirection="column" gap="xs">
          <Text size="caption" weight="medium">Open gaps</Text>
          {state.gaps.map((gap) => (
            <Box key={`gap-${gap.id}`} flexDirection="row" gap="xs">
              <Box flexShrink={0}>
                <Text mono size="caption" color={FILL["yellow"]!}>{gap.id}</Text>
              </Box>
              {(gap.unit || gap.stage) !== "" && (
                <Box flexShrink={0}>
                  <Text mono dimColor size="caption">{gap.unit || gap.stage}</Text>
                </Box>
              )}
              <Box flexShrink={1}>
                <Text size="footnote">{gap.text}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {state.partial && <Text dimColor size="caption">The log is over 4 MiB: the pane read its tail only.</Text>}
      {p.problem !== undefined && <Text size="footnote" color={FILL["red"]!}>{p.problem}</Text>}

      <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
        <Box flexShrink={1} overflow="hidden">
          <Text mono dimColor size="caption" wrap="truncate">
            {`index.json read ${readTime(p.readAt)} · ${sourceOf(plan)}`}
          </Text>
        </Box>
        <Box flexDirection="row" flexShrink={0} gap="xs">
          <Button key="plans" label="Plans" onPress={p.plans} />
          {!p.isMainView && <Button key="back" label="Main transcript" onPress={p.back} />}
          {p.isLive && (
            <Button
              key="quiet"
              label={p.isQuiet ? "Show tool rows" : "Hide tool rows"}
              onPress={p.toggleQuiet}
            />
          )}
          <Button key="close" label="Close" role="dismiss" onPress={p.close} />
        </Box>
      </Box>
    </Box>
  );
}

export type PlanList = {
  queue: QueueRow[];
  archived: string[];
  isArchivedOpen: boolean;
  isWaiting: boolean;
  mode: string;
  problem?: string | undefined;
  readAt?: number | undefined;
  hasPlan: boolean;
  isTerminal: boolean;
  width: number;
  close: () => unknown;
  back: () => unknown;
  pick: (folder: string) => unknown;
  toggleArchived: () => unknown;
};

const LABELS: Record<string, string> = {
  RUNNING: "Running",
  APPROVED: "Not run",
  COMPLETE: "Complete",
};

/** What a row's second line says of it. */
function reasonOf(row: QueueRow): string {
  if (row.group === "ready") {
    return "ready to run";
  }
  if (row.group === "waiting") {
    return `waits for ${row.waitsFor.join(", ")}`;
  }
  const ended = time(row.ended);
  if (ended !== undefined) {
    return `ended ${new Date(ended).toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${
      clock(ended)
    }`;
  }

  return `started ${clock(time(row.started))}`;
}

const lapOf = (row: QueueRow, now: number | undefined) =>
  span(time(row.started), time(row.ended) ?? (row.status === "RUNNING" ? now : undefined));

/** The units bar of one list row. */
function unitsSvg(row: QueueRow): string {
  const share = row.total ? (row.done ?? 0) / row.total : 0;
  const fill = row.status === "RUNNING" ? FILL["blue"]! : FILL["green"]!;

  return svgOf(BAR_HEIGHT, [
    rect(0, SVG_WIDTH, BAR_HEIGHT, PENDING, { rx: 40, opacity: 0.2 }),
    ...(share > 0 ? [rect(0, share * SVG_WIDTH, BAR_HEIGHT, fill, { rx: 40 })] : []),
  ]);
}

/** The plan list: every surface, the terminal as text rows. */
export function drawList(ui: Ui, p: PlanList) {
  const { Box, Text, Button } = ui;
  const notice = p.isWaiting
    ? `/vwf:execute ${p.mode} has started. The pane will change to the plan details at the claim.`
    : undefined;
  const controls = (
    <Box flexDirection="row" flexShrink={0} gap="xs">
      {p.hasPlan && (
        <Button
          key="back-plan"
          label="Back to plan"
          {...(p.isTerminal
            ? { hotkey: "b" }
            : {})}
          onPress={p.back}
        />
      )}
      {p.isTerminal && <Text>{" "}</Text>}
      <Button
        key="close"
        label="Close"
        {...(p.isTerminal ? { hotkey: "c" } : { role: "dismiss" as const })}
        onPress={p.close}
      />
    </Box>
  );
  const archivedRow = p.archived.length > 0 && (
    <Button
      key="archived"
      plain
      label={`${p.isArchivedOpen ? "▾" : "▸"} Archived plans (${p.archived.length})`}
      onPress={p.toggleArchived}
    />
  );
  const archivedRows = p.isArchivedOpen
    ? p.archived.map((name) => (
      <Button
        key={`archived-${name}`}
        plain
        label={name}
        onPress={() => p.pick(`docs/plans/archived/${name}`)}
      />
    ))
    : [];
  const empty = p.queue.length === 0 && <Text dimColor>docs/plans/index.json has no plans.</Text>;

  if (p.isTerminal) {
    return (
      <Box flexDirection="column">
        {controls}
        <Text bold>Plans</Text>
        {notice !== undefined && <Text color="blue">{fit(notice, p.width)}</Text>}
        {p.problem !== undefined && <Text color="red">{fit(p.problem, p.width)}</Text>}
        {empty}
        {p.queue.map((row) => (
          <Button
            key={`plan-${nameOf(row.folder)}`}
            plain
            onPress={() => p.pick(row.folder)}
          >
            {fit(row.number === undefined ? "—" : String(row.number), 3)}
            {fit(row.title, Math.max(20, p.width - 30))}
            {fit(LABELS[row.status] ?? row.status, 10)}
            {fit(row.total === undefined ? "—" : `${row.done}/${row.total}`, 7)}
            {lapOf(row, p.readAt)}
          </Button>
        ))}
        {archivedRow}
        {archivedRows}
      </Box>
    );
  }

  const { Svg } = ui as GraphicUi;
  const COLUMNS = ["5%", "53%", "18%", "14%", "10%"];
  const cell = (size: string, key: string, child: RenderChildren) => (
    <Box key={key} width={size} flexShrink={0} overflow="hidden">
      {child}
    </Box>
  );
  const statusColor = (row: QueueRow) => colorName(row.status) ?? "yellow";

  return (
    <Box flexDirection="column" gap="sm">
      <Box flexDirection="row" justifyContent="space-between" gap="sm">
        <Box flexDirection="column" flexShrink={1}>
          <Text size="heading" weight="medium">Plans</Text>
          <Text mono dimColor size="caption">
            {`docs/plans/index.json · ${p.queue.length} rows`}
          </Text>
        </Box>
        {p.isWaiting && pill(ui, "waiting", "Waiting for the claim", "blue")}
      </Box>
      {notice !== undefined && (
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={FILL["blue"]!}
          backgroundColor={TINT(FILL["blue"]!)}
          paddingX="sm"
          paddingY="xs"
        >
          <Text size="footnote">{notice}</Text>
        </Box>
      )}
      {p.problem !== undefined && <Text size="footnote" color={FILL["red"]!}>{p.problem}</Text>}
      {empty}
      <Box flexDirection="column" gap="xs">
        {p.queue.length > 0 && (
          <Box flexDirection="row">
            {["#", "Plan", "Status", "Units", "Time"].map((head, i) =>
              cell(COLUMNS[i]!, `head-${head}`, <Text dimColor size="caption">{head}</Text>)
            )}
          </Box>
        )}
        {p.queue.map((row) => {
          const name = nameOf(row.folder);

          return (
            <Box
              key={`row-${name}`}
              flexDirection="row"
              alignItems="center"
              hover={{ backgroundColor: TINT(PENDING) }}
            >
              {cell(
                COLUMNS[0]!,
                "number",
                <Text mono dimColor size="caption">
                  {row.number === undefined ? "—" : String(row.number)}
                </Text>,
              )}
              {cell(
                COLUMNS[1]!,
                "plan",
                <Box flexDirection="column" flexShrink={1} alignItems="flex-start">
                  <Button
                    key={`plan-${name}`}
                    plain
                    label={row.title}
                    onPress={() => p.pick(row.folder)}
                  />
                  <Text wrap="truncate" dimColor size="caption">
                    {`${row.kind} · priority ${row.priority} · ${reasonOf(row)}`}
                  </Text>
                </Box>,
              )}
              {cell(
                COLUMNS[2]!,
                "status",
                <Box flexDirection="row">
                  {pill(ui, `status-${name}`, LABELS[row.status] ?? row.status, statusColor(row))}
                </Box>,
              )}
              {cell(
                COLUMNS[3]!,
                "units",
                <Box flexDirection="column" width="90%" gap="xs">
                  {row.total !== undefined && row.total > 0 && (
                    <Svg
                      source={unitsSvg(row)}
                      alt={`${row.done} of ${row.total} units finished`}
                      height={BAR_HEIGHT}
                    />
                  )}
                  <Text mono dimColor size="caption">
                    {row.total === undefined ? "—" : `${row.done} / ${row.total}`}
                  </Text>
                </Box>,
              )}
              {cell(
                COLUMNS[4]!,
                "time",
                <Text dimColor size="footnote" tabular>{lapOf(row, p.readAt)}</Text>,
              )}
            </Box>
          );
        })}
      </Box>
      {archivedRow}
      {archivedRows}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" gap="sm">
        <Box flexShrink={1} overflow="hidden">
          <Text mono dimColor size="caption" wrap="truncate">{`index.json read ${readTime(p.readAt)}`}</Text>
        </Box>
        {controls}
      </Box>
    </Box>
  );
}
