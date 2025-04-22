# from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
# import torch
# from huggingface_hub import login
# import os 

# HUGGINGFACE_TOKEN = os.environ.get("HF_TOKEN", "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")
# login(token=HUGGINGFACE_TOKEN)

# class ModelLoader:
#     _instance = None

#     def __init__(self):
#         self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
#         # Load Llama-3.1-8B
#         self.llama_model = AutoModelForCausalLM.from_pretrained(
#             "meta-llama/Llama-3.1-8B",
#             torch_dtype=torch.bfloat16,
#             device_map="auto"
#         )
#         self.llama_tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B")
        
#         # Load scoring model
#         self.scoring_model = pipeline(
#             "text-classification",
#             model="distilbert-base-uncased",
#             device=self.device
#         )

#     @classmethod
#     def instance(cls):
#         if cls._instance is None:
#             cls._instance = cls()
#         return cls._instance