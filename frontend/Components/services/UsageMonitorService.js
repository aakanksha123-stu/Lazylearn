// // src/services/UsageMonitorService.js
// import {
//   checkForPermission,
//   showUsageAccessSettings,
//   queryUsageStats,
//   EventFrequency,
// } from "@justdice/react-native-usage-stats";

// let timer = null;
// let lastCheckTime = Date.now();
// let onTriggerCallback = null;

// // distraction apps
// const DISTRACTION_APPS = [
//   "com.instagram.android",
//   "com.facebook.katana",
//   "com.snapchat.android",
//   "com.google.android.youtube",
//   "com.pubg.imobile",
//   "com.mobile.legends",
// ];

// const THRESHOLD_MINUTES = 15; // change to 0.25 for quick test

// export const UsageMonitorService = {
//   async init() {
//     const granted = await checkForPermission();
//     if (!granted) {
//       await showUsageAccessSettings();
//     }
//     this.startLoop();
//   },

//   startLoop() {
//     if (timer) return;

//     timer = setInterval(async () => {
//       const now = Date.now();
//       const stats = await queryUsageStats(
//         EventFrequency.INTERVAL_DAILY,
//         lastCheckTime,
//         now
//       );
//       lastCheckTime = now;
//       this.processStats(stats);
//     }, 60 * 1000); // every 1 min
//   },

//   processStats(stats) {
//     let distractionTime = 0;

//     stats.forEach((s) => {
//       if (DISTRACTION_APPS.includes(s.packageName)) {
//         distractionTime += s.totalTimeInForeground || 0;
//       }
//     });

//     if (distractionTime >= THRESHOLD_MINUTES * 60 * 1000) {
//       if (onTriggerCallback) onTriggerCallback();
//       distractionTime = 0; // reset counter
//     }
//   },

//   setOnTrigger(cb) {
//     onTriggerCallback = cb;
//   },

//   stop() {
//     if (timer) clearInterval(timer);
//     timer = null;
//   },
// };

import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const { UsageStatsModule } = NativeModules;

export const UsageMonitorService = {
  interval: null,
  onTrigger: null,
  lastApp: null,

  async init() {
    if (Platform.OS !== "android") return;

    const granted = await PermissionsAndroid.request(
      "android.permission.PACKAGE_USAGE_STATS"
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn("Usage Access not granted.");
      return;
    }

    console.log("✅ Usage access granted — monitoring started");

    // Polling interval for demo (every 5 seconds)
    this.interval = setInterval(async () => {
      try {
        const topApp = await UsageStatsModule.getTopApp();

        if (
          topApp &&
          ["com.instagram.android", "com.facebook.katana", "com.google.android.youtube", "com.snapchat.android"].includes(
            topApp
          )
        ) {
          if (this.onTrigger) this.onTrigger();
        }

        this.lastApp = topApp;
      } catch (err) {
        console.error("⚠️ Error fetching usage stats:", err);
      }
    }, 5000);
  },

  setOnTrigger(cb) {
    this.onTrigger = cb;
  },

  stop() {
    if (this.interval) clearInterval(this.interval);
    console.log("🛑 Usage monitor stopped");
  },
};
