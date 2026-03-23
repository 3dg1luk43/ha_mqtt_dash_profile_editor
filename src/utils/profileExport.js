// Export/import utilities for MQTTDash profiles

/**
 * Build the flat JSON profile accepted by HA mqtt_dash integration.
 * Omits MQTT topics (HA generates those). Only includes non-empty/non-default fields.
 */
export function buildProfile(state) {
  const { grid, widgets } = state;

  const gridOut = {
    columns: grid.columns,
    widget_dimensions: grid.widget_dimensions,
    widget_margins: grid.widget_margins,
    widget_size: grid.widget_size ?? [1, 1],
  };

  const widgetsOut = widgets.map((w) => {
    const out = {};

    // Always include: id, type, x, y, w, h
    out.id = w.id;
    out.type = w.type;
    if (w.entity_id) out.entity_id = w.entity_id;
    if (w.label) out.label = w.label;
    out.x = w.x;
    out.y = w.y;
    out.w = w.w;
    out.h = w.h;
    if (w.protected) out.protected = true;

    // Type-specific extra fields
    if (w.unit) out.unit = w.unit;
    if (w.text) out.text = w.text;
    if (w.time_pattern) out.time_pattern = w.time_pattern;
    if (w.stream_url) out.stream_url = w.stream_url;
    if (w.scale_mode) out.scale_mode = w.scale_mode;
    if (w.overlay_button && w.overlay_button.entity_id) {
      out.overlay_button = { ...w.overlay_button };
    }
    if (w.attrs && w.attrs.length > 0) out.attrs = w.attrs;
    if (w.attr_units && Object.keys(w.attr_units).length > 0) {
      out.attr_units = { ...w.attr_units };
    }
    if (w.modes && w.modes.length > 0) out.modes = w.modes;
    if (w.state_formats && Object.keys(w.state_formats).length > 0) {
      out.state_formats = { ...w.state_formats };
    }
    // Printer entities
    for (const f of ['nozzle_entity', 'bed_entity', 'time_entity', 'progress_entity', 'status_entity', 'progress_unit']) {
      if (w[f]) out[f] = w[f];
    }
    if (w.visible_rows && w.visible_rows.length > 0) out.visible_rows = w.visible_rows;

    // Format block — only include if has any keys
    if (w.format && Object.keys(w.format).length > 0) {
      out.format = { ...w.format };
    }

    return out;
  });

  const profile = {};
  if (state.banner) profile.banner = state.banner;
  profile.grid = gridOut;
  profile.widgets = widgetsOut;
  return profile;
}

/**
 * Parse a JSON string into profile state.
 * Returns { ok: true, data } or { ok: false, error }.
 */
export function parseProfile(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.grid || !Array.isArray(parsed.widgets)) {
      return { ok: false, error: 'Missing required fields: grid, widgets' };
    }
    return { ok: true, data: parsed };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Convert a parsed profile into store-compatible state shape.
 * Assigns unique IDs if missing.
 */
export function profileToState(profile) {
  const grid = {
    columns: profile.grid.columns ?? 6,
    widget_dimensions: profile.grid.widget_dimensions ?? [120, 120],
    widget_margins: profile.grid.widget_margins ?? [5, 5],
    widget_size: profile.grid.widget_size ?? [1, 1],
    devOverlay: profile.grid.devOverlay ?? false,
  };

  const widgets = (profile.widgets ?? []).map((w, i) => ({
    ...w,
    id: w.id || `widget_${Date.now()}_${i}`,
  }));

  return {
    banner: profile.banner ?? '',
    grid,
    widgets,
  };
}
