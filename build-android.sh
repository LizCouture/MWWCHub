#!/bin/bash

ANDROID_HOME=$(echo ~)/Android/Sdk
PATH=$PATH:$ANDROID_HOME/build-tools/26.0.1

APK=$(pwd)/platforms/android/build/outputs/apk/android-release-unsigned.apk

cordova prepare
cordova build --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore mwwc.keystore $APK mwwc
rm mwwc.apk
zipalign -v 4 $APK mwwc.apk