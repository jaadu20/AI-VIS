import torch

# Basic GPU check
print("GPU Available:", torch.cuda.is_available())

# Detailed information (if GPU is available)
if torch.cuda.is_available():
    print("\n=== GPU Details ===")
    print("Device Name:", torch.cuda.get_device_name(0))  # Name of first GPU
    print("Current Device:", torch.cuda.current_device())  # ID of current GPU
    print("Device Count:", torch.cuda.device_count())    # Number of GPUs available
    print("CUDA Version:", torch.version.cuda)           # CUDA version PyTorch was built with
else:
    print("\nPyTorch is not using a GPU. Check:")
    print("- NVIDIA drivers are installed")
    print("- CUDA-compatible PyTorch version installed")
    print("- Your GPU is CUDA-capable")