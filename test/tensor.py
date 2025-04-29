import tensorflow as tf

# Print TensorFlow version
print("TensorFlow version:", tf.__version__)

# Check for available GPUs
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print(f"TensorFlow is using CUDA. {len(gpus)} GPU(s) available:")
    for gpu in gpus:
        print(" -", gpu.name)
else:
    print("TensorFlow is NOT using CUDA (no GPU detected).")
