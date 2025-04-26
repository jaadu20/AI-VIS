import os
import unittest
import azure.cognitiveservices.speech as speechsdk

class TestAzureSpeech(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # read from env vars; you can also hard-code, but env is safer
        key = os.getenv("AZURE_SPEECH_KEY")
        region = os.getenv("AZURE_SERVICE_REGION")
        if not key or not region:
            raise EnvironmentError(
                "Please set AZURE_SPEECH_KEY and AZURE_SERVICE_REGION"
            )
        cls.speech_config = speechsdk.SpeechConfig(subscription=key, region=region)
        # choose a file name for the synthesized audio
        cls.test_wav = "azure_tts_test.wav"
        # phrase to test
        cls.test_phrase = "Hello world, this is a test of Azure speech services."

    def test_1_text_to_speech(self):
        # synthesize to file
        audio_cfg = speechsdk.audio.AudioConfig(filename=self.test_wav)
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=audio_cfg
        )
        result = synthesizer.speak_text_async(self.test_phrase).get()

        # verify we actually synthesized audio
        self.assertEqual(
            result.reason,
            speechsdk.ResultReason.SynthesizingAudioCompleted,
            msg=f"TTS failed: {result.reason}"
        )
        # basic file-exists check
        self.assertTrue(os.path.exists(self.test_wav), msg="WAV file not created")

    def test_2_speech_to_text(self):
        # recognize from the file we just created
        audio_cfg = speechsdk.audio.AudioConfig(filename=self.test_wav)
        recognizer = speechsdk.SpeechRecognizer(
            speech_config=self.speech_config,
            audio_config=audio_cfg
        )
        result = recognizer.recognize_once_async().get()

        # ensure recognition succeeded
        self.assertEqual(
            result.reason,
            speechsdk.ResultReason.RecognizedSpeech,
            msg=f"STT failed: {result.reason}"
        )
        # simple check that key words survived the round-trip
        recognized = result.text.lower()
        expected = "hello world"
        self.assertIn(expected, recognized,
                      msg=f"Expected '{expected}' in recognition, got: '{result.text}'")

        print(f"\nRound-trip recognized text: «{result.text}»")

if __name__ == "__main__":
    unittest.main()
