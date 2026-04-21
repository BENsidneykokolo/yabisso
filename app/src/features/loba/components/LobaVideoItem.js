import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const LobaVideoItem = ({ 
  source, 
  style, 
  resizeMode, 
  shouldPlay, 
  isLooping, 
  isMuted,
  onPlaybackStatusUpdate,
  ...props 
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Cleanup function to ensure the player is unloaded safely
    return () => {
      if (videoRef.current) {
        // We use a try-catch and check if the instance exists
        // Calling unloadAsync explicitly on unmount is key for Android stability
        const cleanup = async () => {
          try {
            await videoRef.current.unloadAsync();
          } catch (e) {
            // Silently fail if already unloaded or error during shutdown
            console.log('LobaVideoItem: Error during cleanup', e);
          }
        };
        cleanup();
      }
    };
  }, []);

  return (
    <Video
      ref={videoRef}
      source={source}
      style={style}
      resizeMode={resizeMode}
      shouldPlay={shouldPlay}
      isLooping={isLooping}
      isMuted={isMuted}
      onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      {...props}
    />
  );
};

export default LobaVideoItem;
