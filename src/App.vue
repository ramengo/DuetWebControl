<template>
	<v-app>
		<v-navigation-drawer v-if="!showBottomNavigation" v-model="drawer" clipped fixed app
							 :width="drawerWidth" :expand-on-hover="iconMenu || isPortraitTouch"
							 :mini-variant="iconMenu || isPortraitTouch" :style="`padding-bottom: ${bottomMargin}px`">
			<div class="mb-3 hidden-sm-and-up">
				<div class="ma-2">
					<connect-btn v-if="showConnectButton" class="mb-2" block />
				</div>
				<upload-btn target="start" :elevation="1" class="ma-2" block />
			</div>

			<v-list class="pt-0" :dense="!$vuetify.breakpoint.smAndDown" :expand="!$vuetify.breakpoint.smAndDown">
				<v-list-group v-for="(category, index) in categories" :key="index" :prepend-icon="category.icon"
							  no-action :value="isExpanded(category)">
					<template #activator>
						<v-list-item-title class="mr-0">
							{{ category.translated ? category.caption : $t(category.caption) }}
						</v-list-item-title>
					</template>

					<v-list-item v-for="(page, pageIndex) in getPages(category)" :key="`${index}-${pageIndex}`" v-ripple
								 :to="page.path" @click.prevent="">
						<v-list-item-icon>
							<v-icon v-text="page.icon"></v-icon>
						</v-list-item-icon>
						<v-list-item-title>
							{{ page.translated ? page.caption : $t(page.caption) }}
						</v-list-item-title>
					</v-list-item>
				</v-list-group>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar ref="appToolbar" app clipped-left>
			<v-app-bar-nav-icon v-show="!showBottomNavigation" @click.stop="drawer = !drawer">
				<v-icon>mdi-menu</v-icon>
			</v-app-bar-nav-icon>
			<v-toolbar-title class="px-1">
				<a href="javascript:void(0)" id="title">
					{{ name }}
				</a>
			</v-toolbar-title>

			<v-tooltip bottom>
				<template #activator="{ on, attrs }">
					<v-btn icon class="ml-2" :color="doorColor" v-bind="attrs" v-on="on" @click="onDoorBtnClick">
						<v-icon>{{ doorIcon }}</v-icon>
					</v-btn>
				</template>
				<span>{{ doorTooltip }}</span>
			</v-tooltip>

			<v-tooltip bottom>
				<template #activator="{ on, attrs }">
					<v-btn icon class="ml-1" :color="bedPresent ? 'success' : 'error'" v-bind="attrs" v-on="on">
						<v-icon>{{ bedPresent ? 'mdi-layers' : 'mdi-layers-remove' }}</v-icon>
					</v-btn>
				</template>
				<span>{{ bedPresent ? 'Piano presente' : 'Piano non presente' }}</span>
			</v-tooltip>

			<connect-btn v-if="showConnectButton" class="hidden-xs-only ml-3" />

			<v-spacer />

			<code-input class="mx-3 hidden-sm-and-down" />

			<v-tooltip v-if="hasPendingMessage" bottom>
				<template #activator="{ on, attrs }">
					<v-btn icon color="warning" class="mx-1" v-bind="attrs" v-on="on" @click="sendM292">
						<v-icon>mdi-bell-ring</v-icon>
					</v-btn>
				</template>
				<span>Invia M292 — riprendi dopo messaggio</span>
			</v-tooltip>

			<v-spacer />

			<upload-btn target="start" :elevation="1" class="mr-3 hidden-sm-and-down" />
			<emergency-btn />
		</v-app-bar>

		<v-main id="content" :style="`margin-bottom: ${bottomMargin}px`">
			<v-container class="hidden-sm-and-down" id="global-container" fluid>
				<fff-container-panel v-if="isFFForUnset" />
				<cnc-container-panel v-else />
			</v-container>

			<v-divider class="hidden-sm-and-down" />

			<v-container fluid>
				<keep-alive>
					<router-view />
				</keep-alive>
			</v-container>
		</v-main>

		<notification-display />

		<v-bottom-navigation v-if="showBottomNavigation" app>
			<v-menu v-for="(category, index) in categories" :key="index" top offset-y>
				<template #activator="{ on }">
					<v-btn v-on="on">
						{{ category.translated ? category.caption : $t(category.caption) }}
						<v-icon v-text="category.icon" class="mb-1" />
					</v-btn>
				</template>

				<v-list-item v-for="(page, pageIndex) in getPages(category)" :key="`${index}-${pageIndex}`"
							 :to="page.path" @click.prevent="" class="global-control">
					<v-icon v-text="page.icon" class="mr-2" />
					{{ page.translated ? page.caption : $t(page.caption) }}
				</v-list-item>
			</v-menu>
		</v-bottom-navigation>

		<connect-dialog />
		<connection-dialog />
		<file-transfer-dialog />
		<message-box-dialog />
		<plugin-install-dialog />
		<incompatible-versions-dialog />

		<component v-for="component in injectedComponentNames" :is="component" :key="component" />
	</v-app>
</template>

<script lang="ts">
import ObjectModel, { MachineMode, MachineStatus } from "@duet3d/objectmodel";
import Piecon from "piecon";
import Vue, { Component } from "vue";
import { Route, NavigationGuardNext } from "vue-router";

import { Menu, MenuCategory, MenuItem, Routes } from "@/routes";
import store from "@/store";
import { DashboardMode } from "@/store/settings";
import { isPrinting } from "@/utils/enums";
import { LogType } from "./utils/logging";

export default Vue.extend({
	computed: {
		name(): string { return store.state.machine.model.network.name; },
		isConnecting(): boolean { return store.state.isConnecting || store.state.machine.isReconnecting; },
		status(): MachineStatus { return store.state.machine.model.state.status; },
		iconMenu(): boolean { return store.state.settings.iconMenu; },
		jobProgress(): number { return store.getters["machine/model/jobProgress"]; },
		injectedComponents(): Array<{ name: string, component: Component }> { return store.state.uiInjection.injectedComponents; },
		model(): ObjectModel { return store.state.machine.model; },
		categories(): Array<MenuCategory> {
			return Object.keys(Menu)
				.map(key => Menu[key])
				.filter(item => item.pages.some(page => page.condition && !store.state.settings.hiddenMenuItems.includes(page.path)));
		},
		currentPageCondition(): boolean {
			const currentRoute = this.$route;
			let checkRoute = (route: MenuItem, isChild = false) => {
				let flag = (route.path === currentRoute.path && route.condition);
				if (!flag && isChild) {
					let curPath = currentRoute.path.replace(/\/$/, "");
					if (curPath.endsWith(route.path))
						flag = (curPath.substring(0, curPath.length - route.path.length) + route.path === curPath && route.condition)
				}
				return flag;
			};
			return Routes.some(route => checkRoute(route as MenuItem));
		},
		darkTheme(): boolean { return store.state.settings.darkTheme; },
		isFFForUnset(): boolean {
			if (store.state.settings.dashboardMode === DashboardMode.default) {
				return !this.model.state.machineMode || this.model.state.machineMode === MachineMode.fff;
			}
			return store.state.settings.dashboardMode === DashboardMode.fff;
		},
		isPortraitTouch(): boolean {
			return !this.$vuetify.breakpoint.lgAndUp;  // < 1264px (lg breakpoint)
		},
		showBottomNavigation(): boolean {
			return (this.$vuetify.breakpoint.mobile || this.isPortraitTouch) &&
				   !this.$vuetify.breakpoint.xsOnly &&
				   store.state.settings.bottomNavigation;
		},
		doNotSwitchToStatusPanelOnJobStart(): boolean {
			return store.state.settings.behaviour.jobStart;
		},
		bottomMargin(): number {
			return store.state.bottomMargin;
		},
		drawerWidth(): number {
			if (this.isPortraitTouch && !this.iconMenu) return 48;
			return this.$vuetify.breakpoint.smAndDown ? 275 : 256;
		},
		doorOpen(): boolean {
			const interlock = store.state.machine.model.sensors.gpIn[9]?.value ?? false;
			const latch = store.state.machine.model.sensors.gpIn[10]?.value ?? false;
			return !interlock && !latch;
		},
		doorColor(): string {
			const interlock = store.state.machine.model.sensors.gpIn[9]?.value ?? false;
			const latch = store.state.machine.model.sensors.gpIn[10]?.value ?? false;
			if (!interlock && !latch) return "success";   // porta aperta
			if (interlock && latch)   return "error";     // interblocco attivato, chiusa
			return "warning";                             // interblocco disattivato, chiusa
		},
		doorIcon(): string {
			const latch = store.state.machine.model.sensors.gpIn[10]?.value ?? false;
			return latch ? "mdi-lock" : "mdi-lock-open-variant";
		},
		doorTooltip(): string {
			const interlock = store.state.machine.model.sensors.gpIn[9]?.value ?? false;
			const latch = store.state.machine.model.sensors.gpIn[10]?.value ?? false;
			if (!interlock && !latch) return "Porta aperta";
			if (interlock && latch)   return "Interblocco attivato — porta chiusa";
			return "Interblocco disattivato — porta chiusa";
		},
		bedPresent(): boolean {
			return !(store.state.machine.model.sensors.gpIn[11]?.value ?? false);
		},
		hasPendingMessage(): boolean {
			const mb = store.state.machine.model.state.messageBox;
			return mb !== null && mb.mode !== null;
		}
	},
	data() {
		return {
			drawer: this.$vuetify.breakpoint.lgAndUp,
			injectedComponentNames: new Array<string>(),
			showConnectButton: process.env.NODE_ENV === "development"
		};
	},
	methods: {
		async onDoorBtnClick() {
			const latch = store.state.machine.model.sensors.gpIn[10]?.value ?? false;
			const code = latch ? "M1203" : "M1202";
			await store.dispatch("machine/sendCode", code);
		},
		async sendM292() {
			const mb = store.state.machine.model.state.messageBox;
			const code = (mb?.seq !== null && mb?.seq !== undefined) ? `M292 S${mb.seq}` : "M292";
			await store.dispatch("machine/sendCode", { code, noWait: true });
		},
		isExpanded(category: MenuCategory): boolean {
			if (this.$vuetify.breakpoint.smAndDown) {
				const route = this.$route;
				return category.pages.some(page => page.path === route.path);
			}
			return true;
		},
		getPages(category: MenuCategory): Array<MenuItem> {
			return category.pages.filter(page => page.condition && !store.state.settings.hiddenMenuItems.includes(page.path));
		},
		updateTitle(): void {
			if (this.status === MachineStatus.disconnected) {
				document.title = `(${this.name})`;
			} else {
				const jobProgress = this.jobProgress;
				const title = ((jobProgress > 0 && isPrinting(this.status)) ? `(${(jobProgress * 100).toFixed(1)}%) ` : '') + this.name;
				if (document.title !== title) {
					document.title = title;
				}
			}
		},
	},
	mounted() {
		// Attempt to disconnect from every machine when the page is being unloaded
		window.addEventListener("unload", () => store.dispatch("disconnectAll"));

		// Connect if running on a board
		if (process.env.NODE_ENV === "production") {
			store.dispatch("connect");
		}

		// Attempt to load the settings
		store.dispatch("settings/load");

		// Validate navigation
		Vue.prototype.$vuetify = this.$vuetify;
		this.$router.beforeEach((to: Route, _from: Route, next: NavigationGuardNext) => {
			if (Routes.some(route => route.path === to.path && !(route as MenuItem).condition)) {
				next("/");
			} else {
				next();
			}
		});

		// Set up Piecon
		Piecon.setOptions({
			color: "#00f",			// Pie chart color
			background: "#bbb",		// Empty pie chart color
			shadow: "#fff",			// Outer ring color
			fallback: false			// Toggles displaying percentage in the title bar (possible values - true, false, 'force')
		});
	},
	watch: {
		currentPageCondition(to: boolean) {
			if (!to) {
				this.$router.push("/");
			}
		},
		darkTheme(to: boolean) {
			this.$vuetify.theme.dark = to;
		},
		isConnecting(to: boolean) {
			if (!to && store.state.machine.model.volumes.length > 0) {
				const firstVolume = store.state.machine.model.volumes[0];
				if (firstVolume.capacity !== null && firstVolume.freeSpace !== null &&
					firstVolume.capacity > 268435456 && (firstVolume.freeSpace as number) / (firstVolume.capacity as number) < 0.05)		// 256 MiB
				{
					// Report a warning if less than 5% free space is available
					this.$log(LogType.warning, this.$t("notification.freeSpaceWarning.title"), this.$t("notification.freeSpaceWarning.message"));
				}
			}
		},
		status(to: MachineStatus, from: MachineStatus) {
			if (to === MachineStatus.disconnected || from === MachineStatus.disconnected) {
				this.updateTitle();
			}

			const printing = isPrinting(to);
			if (printing !== isPrinting(from)) {
				if (printing) {
					// Go to Job Status when a print starts
					if (this.$router.currentRoute.path !== "/Job/Status" && !this.doNotSwitchToStatusPanelOnJobStart) {
						this.$router.push("/Job/Status");
					}
				} else {
					// Remove the Piecon again when the print has finished
					Piecon.reset();
				}
			}
		},
		name() { this.updateTitle(); },
		jobProgress(to: number, from: number) {
			if (isPrinting(this.status) && Math.round(to * 100) !== Math.round(from * 100)) {
				Piecon.setProgress(to * 100);
			}
			this.updateTitle();
		},
		injectedComponents() {
			for (const item of this.injectedComponents) {
				if (!this.injectedComponentNames.includes(item.name)) {
					(this.$options as any).components[item.name] = item.component;
					this.injectedComponentNames.push(item.name);
				}
			}
		}
	}
});
</script>
