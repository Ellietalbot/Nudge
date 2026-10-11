/**
 * "Read to me": reads Nudge's words aloud with the phone's text-to-speech.
 * Sand secondary style; turns navy with "Stop" while reading.
 * Install: npx expo install expo-speech
 */
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { IconStop, IconVolume } from './icons';
import { Text } from './Text';
import { focusRing, hitSlopFor, palette, radius, shadow } from './tokens';

export function ReadAloudButton({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => () => { Speech.stop(); }, []);

  const toggle = () => {
    if (playing) { Speech.stop(); setPlaying(false); return; }
    Speech.stop();
    Speech.speak(text, { rate: 0.9, onDone: () => setPlaying(false), onStopped: () => setPlaying(false), onError: () => setPlaying(false) });
    setPlaying(true);
  };

  const fg = playing ? palette.white : palette.navy;
  return (
    <Pressable
      onPress={toggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      hitSlop={hitSlopFor(40)}
      accessibilityRole="button"
      accessibilityLabel={playing ? 'Stop reading' : 'Read to me'}
      accessibilityState={{ selected: playing }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: playing ? palette.navy : palette.sand, boxShadow: pressed ? undefined : shadow.press(playing ? palette.navyPress : palette.sandPress, 3), transform: [{ translateY: pressed ? 3 : 0 }] },
        focused && focusRing,
      ]}
    >
      {playing ? <IconStop size={14} color={fg} /> : <IconVolume size={18} color={fg} />}
      <Text variant="label" color={fg}>{playing ? 'Stop' : 'Read to me'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14, borderRadius: radius.pill, alignSelf: 'flex-start' },
});
