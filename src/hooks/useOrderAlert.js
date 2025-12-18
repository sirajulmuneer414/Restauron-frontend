import { useCallback } from 'react';
import notificationSound from '../assets/notification.mp3.wav';

const useOrderAlert = () => {
  // We accept 'text' as a parameter now. 
  // We can also set a default message if nothing is passed.
  const playAlert = useCallback((text = "Alert alert") => {
    
    if (!('speechSynthesis' in window)) {
      console.error("Browser does not support text-to-speech");
      const audio = new Audio(notificationSound); // Fallback sound
        audio.play().catch(e => console.log("Audio play failed", e));
      return;
    }

    // Cancel any current speaking to avoid audio overlap/queuing
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurations
    utterance.lang = 'en-US';
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  }, []);

  return playAlert;
};

export default useOrderAlert;