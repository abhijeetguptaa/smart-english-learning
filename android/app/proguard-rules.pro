# Capacitor ProGuard rules
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.community.** { *; }

# WebView and JS Interface
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve line numbers for better crash reports in Vitals (optional, but recommended)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Optimize more aggressively
-optimizationpasses 5
-allowaccessmodification

# Handle Kotlin
-dontwarn kotlin.**
-dontwarn org.jetbrains.annotations.**

# Handle AndroidX
-dontwarn androidx.**
