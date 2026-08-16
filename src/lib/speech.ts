// Real Web Speech API usage (not a mock) for the audioGuidance preference —
// speaks the current navigation instruction aloud.

export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang.startsWith("en") && /Google|Natural|Samantha|Aria/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
  return cachedVoice;
}

if (isSpeechAvailable()) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
  };
}

export function speak(text: string): void {
  if (!isSpeechAvailable()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.98;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isSpeechAvailable()) window.speechSynthesis.cancel();
}
