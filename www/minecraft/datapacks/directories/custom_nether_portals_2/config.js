const builder = require("../../builder.js");
module.exports = {
	pack: {
		namespace: "custom_nether_portals",
		version: "2.2.1",
		name: "Custom Nether Portals",
		compatibility: ["1.16"],
		description: `
			Ignite nether portals of any shape or size you like, or use crying obsidian in the portal frame. All features are configurable.<br>
			<span class="more">
				Enter "/trigger cusNetPor" for details.<br>
				Enter "/function custom_nether_portals:config" to configure whether non-rectangular nether portals are allowed, whether crying obsidian is allowed in nether portal frames, or the minimum and maximum nether portal size.
			</span>
		`,
		tags: ["custom", "customizable", "customized", "customizer", "nether", "portal", "portals", "shape", "shapes", "shaped", "size", "sizes", "sized", "crying", "obsidian", "light", "ignite", "min", "minimum", "max", "maximum", "rectangle", "rectangular", "circle", "circular", "dynamic", "big", "bigger", "large", "larger", "giant", "huge", "small", "smaller", "tiny"],
		video: "WfqUtUhI7qM"
	},
	mc: {
		dev: false,
		header: "",
		internalScoreboard: "cusNetPor.dummy",
		rootNamespace: null
	},
	global: {
		onBuildSuccess: builder.onBuildSuccess
	}
};
