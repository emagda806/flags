"""Architektura autoenkodera — współdzielona przez train.py i app.py."""

from __future__ import annotations

import torch
import torch.nn as nn

IMG_SIZE = 64
LATENT_DIM = 128
MODEL_VERSION = 2


class ConvAutoencoder(nn.Module):
  """
  Dwa kroki downsamplingu (64→32→16), warstwy 3×3 zachowują detale (herby, symbole).
  Bottleneck: 256×16×16 → latent_dim.
  """

  def __init__(self, latent_dim: int = LATENT_DIM, img_size: int = IMG_SIZE):
    super().__init__()
    self.latent_dim = latent_dim
    self.img_size = img_size
    self.encoder = nn.Sequential(
      nn.Conv2d(3, 64, 3, padding=1),
      nn.BatchNorm2d(64),
      nn.ReLU(inplace=True),
      nn.Conv2d(64, 128, 4, stride=2, padding=1),
      nn.BatchNorm2d(128),
      nn.ReLU(inplace=True),
      nn.Conv2d(128, 256, 3, padding=1),
      nn.BatchNorm2d(256),
      nn.ReLU(inplace=True),
      nn.Conv2d(256, 256, 4, stride=2, padding=1),
      nn.BatchNorm2d(256),
      nn.ReLU(inplace=True),
      nn.Conv2d(256, 256, 3, padding=1),
      nn.BatchNorm2d(256),
      nn.ReLU(inplace=True),
    )
    self._flat = 256 * 16 * 16
    self.fc_enc = nn.Linear(self._flat, latent_dim)
    self.fc_dec = nn.Linear(latent_dim, self._flat)
    self.decoder = nn.Sequential(
      nn.ConvTranspose2d(256, 256, 4, stride=2, padding=1),
      nn.BatchNorm2d(256),
      nn.ReLU(inplace=True),
      nn.ConvTranspose2d(256, 128, 3, padding=1),
      nn.BatchNorm2d(128),
      nn.ReLU(inplace=True),
      nn.ConvTranspose2d(128, 64, 4, stride=2, padding=1),
      nn.BatchNorm2d(64),
      nn.ReLU(inplace=True),
      nn.Conv2d(64, 3, 3, padding=1),
      nn.Sigmoid(),
    )

  def encode(self, x: torch.Tensor) -> torch.Tensor:
    h = self.encoder(x)
    return self.fc_enc(h.view(h.size(0), -1))

  def decode(self, z: torch.Tensor) -> torch.Tensor:
    h = self.fc_dec(z)
    h = h.view(-1, 256, 16, 16)
    return self.decoder(h)

  def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
    z = self.encode(x)
    return self.decode(z), z
