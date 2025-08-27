import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Defs, Path, G, Use } from 'react-native-svg';

export default function WaveBackground() {
  const [wavePositions, setWavePositions] = useState([0, 0, 0, 0]);
  const animationFrame = useRef<number>();

  useEffect(() => {
    let startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000; // Convert to seconds

      setWavePositions([
        Math.sin(elapsed * 0.3) * 20,     // Very slow wave
        Math.sin(elapsed * 0.4) * 15,     // Slow wave  
        Math.sin(elapsed * 0.5) * 12,     // Medium wave
        Math.sin(elapsed * 0.6) * 10,     // Faster wave
      ]);

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Svg viewBox="0 24 150 28" style={styles.svg}>
        <Defs>
          <Path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </Defs>
        <G>
          {[...Array(4)].map((_, index) => (
            <G key={index}>
              <Use
                href="#gentle-wave"
                x={wavePositions[index]}
                y={`${index * 3}`}
                fill={`rgba(255,255,255,${0.7 - index * 0.1})`}
              />
            </G>
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    overflow: 'hidden',
  },
  svg: {
    width: '200%',
    height: '100%',
  },
});
