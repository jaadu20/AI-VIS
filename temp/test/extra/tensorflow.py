import tensorflow as tf

# List all GPUs and their details
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    print("\n=== GPU Details ===")
    for gpu in gpus:
        print("Name:", gpu.name)
        print("Type:", gpu.device_type)
    print("\nTensorFlow Version:", tf.__version__)
    print("CUDA Supported:", tf.test.is_built_with_cuda())  # Check if built with CUDA
else:
    print("\nNo GPUs detected. Check:")
    print("- TensorFlow GPU version installed")
    print("- NVIDIA drivers/CUDA/cuDNN setup")