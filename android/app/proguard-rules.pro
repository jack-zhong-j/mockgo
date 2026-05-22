# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# WebView JavaScript interface
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}

# Preserve line number information for debugging
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Capacitor plugins
-keep class com.getcapacitor.** { *; }
-keep class com.mockgo.app.plugins.** { *; }

# Location services
-keep class android.location.** { *; }

# Gson/JSON serialization
-keepattributes Signature
-keepattributes *Annotation*
-keep class sun.misc.Unsafe { *; }
-keep class com.google.gson.** { *; }
-keep class com.google.gson.examples.android.model.** { *; }

# Keep model classes for serialization
-keep class * implements java.io.Serializable { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}
