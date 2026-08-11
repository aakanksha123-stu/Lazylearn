import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import { ToastAndroid } from 'react-native'; // For feedback

const DISTRACTING_APPS = ['com.instagram.android', 'com.pubg.imobile', 'com.pubg.krmobile', 'com.google.android.youtube']; // Real package names

let monitoringInterval;
let hasPermission = false;
let nativeModuleReady = false; // Set to true once you implement native module

// Request permission (Android only)
export const requestUsagePermission = async () => {
  if (Platform.OS !== 'android') {
    console.log('App monitoring not supported on iOS');
    return false;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.PACKAGE_USAGE_STATS,
      {
        title: 'Usage Stats Permission',
        message: 'This app needs access to usage stats to detect distracting apps.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      hasPermission = true;
      ToastAndroid.show('Permission granted! Monitoring enabled.', ToastAndroid.SHORT);
      // Note: User must still enable in Settings > Apps > Special access > Usage access
      return true;
    } else {
      hasPermission = false;
      ToastAndroid.show('Permission denied. Using simulation mode.', ToastAndroid.LONG);
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Check if native module is available (implement AppMonitorModule in android/app/src/main/java/.../AppMonitorModule.java)
const getCurrentAppNative = (callback) => {
  if (nativeModuleReady && NativeModules.AppMonitorModule) {
    NativeModules.AppMonitorModule.getCurrentApp((appPackage) => {
      callback(appPackage);
    });
  } else {
    // Fallback simulation
    callback(Math.random() > 0.5 ? 'com.instagram.android' : null); // Simulate distracting app 50% time
  }
};

export const startMonitoring = (onQuizTrigger, setIsOpen) => {
  // Request permission on start
  requestUsagePermission();

  const checkApp = () => {
    getCurrentAppNative((currentApp) => {
      const isDistracting = DISTRACTING_APPS.includes(currentApp);
      setIsOpen(isDistracting);
      if (isDistracting && hasPermission) {
        // Trigger quiz every 3-5 min (180-300s); demo: 10s
        setTimeout(() => onQuizTrigger(true), 10000);
      } else if (!hasPermission) {
        // Simulate even without permission
        if (Math.random() > 0.7) { // 30% chance
          setTimeout(() => onQuizTrigger(true), 10000);
        }
      }
    });
  };

  // Check every 3-5 min (180-300s); demo: every 30s
  monitoringInterval = setInterval(checkApp, 30000);

  // Initial check
  checkApp();

  return () => clearInterval(monitoringInterval);
};

// Native Module Placeholder (Implement in Java/Kotlin)
// Example Java code for android/app/src/main/java/com/yourapp/AppMonitorModule.java
/*
import android.app.usage.UsageStatsManager;
import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Callback;

public class AppMonitorModule extends ReactContextBaseJavaModule {
  private UsageStatsManager usageStatsManager;

  public AppMonitorModule(ReactApplicationContext context) {
    super(context);
    usageStatsManager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
  }

  @Override
  public String getName() { return "AppMonitorModule"; }

  @ReactMethod
  public void getCurrentApp(Callback callback) {
    // Query last 1 min usage
    long endTime = System.currentTimeMillis();
    long startTime = endTime - 60000;
    List<UsageStats> stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime);
    if (!stats.isEmpty()) {
      UsageStats top = Collections.max(stats, (a, b) -> Long.compare(a.getLastTimeUsed(), b.getLastTimeUsed()));
      callback.invoke(top.getPackageName());
    } else {
      callback.invoke("");
    }
  }
}
*/
// Register in MainApplication.java: new AppMonitorModule(getReactNativeHost().getReactInstanceManager().getCurrentContext())