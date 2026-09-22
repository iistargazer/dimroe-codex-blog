import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { registerCondition } from "./quartz/plugins/loader/conditions"
import { componentRegistry } from "./quartz/components/registry"
import type { QuartzPluginData } from "./quartz/plugins/vfile"

// Register extra layout conditions before config loading resolves the layout.
registerCondition("is-index", (props) => props.fileData.slug === "index")

// TS override: keep the 404 page out of the Recent Notes list.
// Function options can't be expressed in quartz.config.yaml, so they go here.
// The key must match the plugin's source string (scoped npm packages keep the scope).
const recentNotesFilter = {
  filter: (page: QuartzPluginData) => page.slug !== "404",
}
componentRegistry.setOptionOverrides("@quartz-community/recent-notes", recentNotesFilter)
componentRegistry.setOptionOverrides("recent-notes", recentNotesFilter)

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
