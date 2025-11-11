import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, PermissionsAndroid, Platform } from 'react-native';
import {
  useCameraDevice,
  useCameraPermission,
  Camera,
  useCameraFormat,
 } from 'react-native-vision-camera';
 import { CameraRoll } from '@react-native-camera-roll/camera-roll'

export function CameraE() {
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

   const cameraRef = useRef<Camera>(null)

  const device = useCameraDevice('back', {
    physicalDevices: [
      'ultra-wide-angle-camera',
      'wide-angle-camera',
      'telephoto-camera'
    ]
  });

  const format = useCameraFormat(device, [
    { photoResolution: { width: 1280, height: 720 } }
  ])

  // 删除空返回，保持统一的设备守卫逻辑


  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>需要摄像头权限</Text>
      </View>
    );
  }

  // 设备尚未就绪（枚举中或无摄像头）
  if (device == null) {
    return (
      <View style={styles.center}>
        <Text>未检测到摄像头设备</Text>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      // Android 运行时权限：根据系统版本选择适配的权限
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('权限未授予: READ_MEDIA_IMAGES');
            return;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('权限未授予: WRITE_EXTERNAL_STORAGE');
            return;
          }
        }
      }

      const file = await cameraRef?.current?.takePhoto();
      if (!file?.path) return;
      await CameraRoll.saveAsset(`file://${file.path}`, { type: 'photo' });
      // console.log('Saved to Camera Roll', file.path);
    } catch (e) {
      console.warn('Save photo failed', e);
    }
  }

  // 通过上述守卫后，TypeScript 会收窄 device 为 CameraDevice
  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        format={format}
        photoQualityBalance="speed"
      />
      <Pressable
        onPress={takePhoto}
        style={{ position: 'absolute', bottom: 32, alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderRadius: 24 }}
      >
        <Text style={{ fontSize: 16 }}>拍照</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});