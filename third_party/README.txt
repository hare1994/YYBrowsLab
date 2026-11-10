Third-party material

public/models/brow-seg.onnx
  Face-parsing model (SegFormer-B0) from EasyPortrait - Face Parsing and Portrait Segmentation Dataset,
  https://github.com/hukenovs/easyportrait
  Licensed under the EasyPortrait public license with attribution and conditions reserved (based on CC BY-SA 4.0):
  see EasyPortrait-LICENSE.pdf in this folder.
  Changes: converted from the original PyTorch checkpoint (segformer-fp-512.pth) to ONNX and quantized to 8-bit
  weights, with input normalization built in. The model weights were not retrained or otherwise modified.
  This converted file is shared under the same license (it is published with the site, next to this notice).
