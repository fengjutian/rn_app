import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useCameraDevice, useCameraPermission, Camera } from 'react-native-vision-camera';

export function CameraE() {
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const device = useCameraDevice('back');

  if (device == null) return


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

  // 通过上述守卫后，TypeScript 会收窄 device 为 CameraDevice
  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});