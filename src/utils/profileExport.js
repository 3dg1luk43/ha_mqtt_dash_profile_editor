// Export/import utilities for MQTTDash profiles (multi-page schema)

const WIDGET_EXTRA_KEYS = [
  'unit', 'text', 'time_pattern', 'stream_url', 'scale_mode', 'overlay_button',
  'attrs', 'attr_units', 'modes', 'state_formats',
  'nozzle_entity', 'bed_entity', 'time_entity', 'progress_entity', 'status_entity',
  'progress_unit', 'visible_rows',
  'default_seconds',  // timer
  'mealie_url', 'mealie_api_key', 'recipe_slug', 'visible_section',  // mealie
];

function exportWidget(w) {
  const out = { id: w.id, type: w.type };
  if (w.entity_id) out.entity_id = w.entity_id;
  if (w.label) out.label = w.label;
  out.x = w.x; out.y = w.y; out.w = w.w; out.h = w.h;
  if (w.protected) out.protected = true;

  for (const key of WIDGET_EXTRA_KEYS) {
    if (key === 'overlay_button') {
      if (w.overlay_button?.entity_id) out.overlay_button = { ...w.overlay_button };
    } else if (key === 'attrs' || key === 'modes' || key === 'visible_rows') {
      if (w[key]?.length > 0) out[key] = w[key];
    } else if (key === 'attr_units' || key === 'state_formats') {
      if (w[key] && Object.keys(w[key]).length > 0) out[key] = { ...w[key] };
    } else {
      if (w[key] != null && w[key] !== '') out[key] = w[key];
    }
  }

  if (w.format && Object.keys(w.format).length > 0) out.format = { ...w.format };
  return out;
}

function exportGrid(grid) {
  return {
    columns: grid.columns,
    widget_dimensions: grid.widget_dimensions,
    widget_margins: grid.widget_margins,
    widget_size: grid.widget_size ?? [1, 1],
  };
}

/**
 * Build the new multi-page profile JSON accepted by HA.
 */
export function buildProfile(state) {
  const profile = {};
  if (state.banner) profile.banner = state.banner;

  profile.ui = {
    navbar_edge: state.navbar_edge ?? 'bottom',
    grid: exportGrid(state.grid),
    pages: (state.pages ?? []).map((page) => {
      const p = { name: page.name, widgets: page.widgets.map(exportWidget) };
      if (page.grid) p.grid = exportGrid(page.grid);
      return p;
    }),
  };

  return profile;
}

/**
 * Parse a JSON string — returns { ok, data } or { ok: false, error }.
 */
export function parseProfile(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    const hasNew = parsed.ui && (Array.isArray(parsed.ui?.pages) || Array.isArray(parsed.ui?.widgets));
    const hasOld = parsed.grid && Array.isArray(parsed.widgets);
    if (!hasNew && !hasOld) {
      return { ok: false, error: 'Missing required fields: expected ui.pages or (grid + widgets)' };
    }
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Convert a parsed profile (old or new format) into store-compatible state.
 */
export function profileToState(profile) {
  // New format: profile.ui.pages
  if (profile.ui) {
    const ui = profile.ui;
    const grid = normaliseGrid(ui.grid ?? {});

    let pages;
    if (Array.isArray(ui.pages) && ui.pages.length > 0) {
      pages = ui.pages.map((p, i) => ({
        id: `page_${Date.now()}_${i}`,
        name: p.name ?? `Page ${i + 1}`,
        widgets: (p.widgets ?? []).map(tagWidget),
        ...(p.grid ? { grid: normaliseGrid(p.grid) } : {}),
      }));
    } else if (Array.isArray(ui.widgets)) {
      // Single-page fallback inside ui
      pages = [{ id: `page_${Date.now()}`, name: 'Main', widgets: ui.widgets.map(tagWidget) }];
    } else {
      pages = [{ id: `page_${Date.now()}`, name: 'Main', widgets: [] }];
    }

    return { banner: profile.banner ?? '', grid, pages, navbar_edge: ui.navbar_edge ?? 'bottom' };
  }

  // Old flat format: { banner, grid, widgets }
  const grid = normaliseGrid(profile.grid ?? {});
  const widgets = (profile.widgets ?? []).map(tagWidget);
  return {
    banner: profile.banner ?? '',
    grid,
    pages: [{ id: `page_${Date.now()}`, name: 'Main', widgets }],
  };
}

function normaliseGrid(g) {
  return {
    columns: g.columns ?? 6,
    widget_dimensions: g.widget_dimensions ?? [120, 120],
    widget_margins: g.widget_margins ?? [5, 5],
    widget_size: g.widget_size ?? [1, 1],
  };
}

function tagWidget(w, i) {
  return { ...w, id: w.id || `widget_${Date.now()}_${i}` };
}
