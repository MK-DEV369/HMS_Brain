import os
import math
import numpy as np
import polars as pl
import tensorflow as tf
import albumentations as A
import cv2
import torch
import torchaudio
from scipy.signal import butter, filtfilt
import pandas as pd
BASE_PATH = r"E:\4th SEM Data\HMS_Main_EL\HMS-Brian\project\backend\intelligence"
TRAIN_EEG_PATH = os.path.join(BASE_PATH, "\train_eegs")
TEST_EEG_PATH = os.path.join(BASE_PATH, "\test_eegs")

n_fft = 800
win_length = 256
hop_length = 44

spec_transform = torchaudio.transforms.Spectrogram(
    n_fft=n_fft, win_length=win_length, hop_length=hop_length, power=None
)

spec_transforms = A.Compose([
    A.Resize(height=96, width=224, interpolation=cv2.INTER_CUBIC, always_apply=True)
])
def MAD(signal, axis=-1):
    median = np.median(signal, axis=axis, keepdims=True)
    abs_dev = np.abs(signal - median)
    mad = np.median(abs_dev, axis=axis, keepdims=True)
    return mad * 1.4826

def butter_filter(data, fs=200, cutoff_freq=[0.25, 50], order=5, btype="bandpass"):
    nyq = 0.5 * fs
    low = cutoff_freq[0] / nyq
    high = cutoff_freq[1] / nyq
    b, a = butter(order, [low, high], btype=btype)
    return filtfilt(b, a, data)
import math
import numpy as np

def bin_array(array, bin_size=4, axis=-1):
    #print(f"Original shape: {array.shape}")
    
    length = array.shape[axis]
    
    # Calculate padding length, ensure it's only added when necessary
    pad_len = (math.ceil(length / bin_size) * bin_size) - length
    #print(f"Padding length: {pad_len}")
    
    # Pad the array to align it with bin_size
    if pad_len > 0:
        array = np.pad(array, [(0, 0)] * axis + [(0, pad_len)] + [(0, 0)] * (array.ndim - axis - 1), mode="reflect")
    #print(f"Padded shape: {array.shape}")
    
    # Calculate the new shape after binning
    num_bins = array.shape[axis] // bin_size  # Number of bins
    new_shape = list(array.shape)
    new_shape[axis] = num_bins  # The first dimension becomes the number of bins
    new_shape.insert(axis + 1, bin_size)  # The second dimension corresponds to bin_size
    #print(f"New shape after insertion: {new_shape}")
    
    # Reshape and compute the mean across the bins
    reshaped_array = array.reshape(new_shape).mean(axis=axis + 1) 
    return reshaped_array
def safe_reshape_eeg(eeg, target_shape=(19, 2500)):
    """Safely reshape EEG array to (19, 2500) by trimming or padding if needed."""
    total_channels = target_shape[0]
    target_length = target_shape[1]
    expected_size = total_channels * target_length

    current_size = eeg.shape[0] * eeg.shape[1]
    if current_size < expected_size:
        # Pad at the end with reflection
        pad_size = expected_size - current_size
        eeg = np.pad(eeg, [(0, 0), (0, pad_size)], mode='reflect')
    elif current_size > expected_size:
        # Trim at the end
        eeg = eeg[:, :expected_size // eeg.shape[0]]
    return eeg.reshape(target_shape)
def compute_eeg_chain(df):
    cols = ["Fp1","Fp2","Fz","Cz","Pz","F3","F4","F7","F8","C3","C4","P3","P4","T3","T4","T5","T6","O1","O2"]
    eeg = [df[col].to_numpy() for col in cols]
    
    ekg = butter_filter(df["EKG"].to_numpy(), cutoff_freq=[0.5, 20.0])
    ekg = bin_array(ekg).reshape(1, -1)

    def pair(a, b): return bin_array(butter_filter(a - b))
    
    ll = [pair(eeg[0], eeg[7]), pair(eeg[7], eeg[13]), pair(eeg[13], eeg[15]), pair(eeg[15], eeg[17])]
    lp = [pair(eeg[0], eeg[5]), pair(eeg[5], eeg[9]), pair(eeg[9], eeg[11]), pair(eeg[11], eeg[17])]
    rp = [pair(eeg[1], eeg[6]), pair(eeg[6], eeg[10]), pair(eeg[10], eeg[12]), pair(eeg[12], eeg[18])]
    rl = [pair(eeg[1], eeg[8]), pair(eeg[8], eeg[14]), pair(eeg[14], eeg[16]), pair(eeg[16], eeg[18])]
    mid = [pair(eeg[2], eeg[3]), pair(eeg[3], eeg[4])]

    chains = np.stack([ll, lp, rp, rl])
    mid = np.stack(mid)
    
    return chains, mid, ekg
def proc_eeg(eeg, mid, ekg):
    eeg[np.isnan(eeg) | np.isinf(eeg)] = 0
    mid[np.isnan(mid) | np.isinf(mid)] = 0
    ekg[np.isnan(ekg) | np.isinf(ekg)] = 0

    eeg -= eeg.mean(axis=-1, keepdims=True)
    mid -= mid.mean(axis=-1, keepdims=True)

    std = np.median(MAD(eeg, axis=-1)) + 1e-5
    eeg = np.clip(eeg / std, -10, 10)
    mid = np.clip(mid / std, -10, 10)
    ekg = ekg / (MAD(ekg, axis=-1).mean() + 1e-5)

    eeg = eeg.reshape(16, -1)
    eeg = np.concatenate([eeg, mid, ekg], axis=0)

    eeg = safe_reshape_eeg(eeg, target_shape=(19, 2500))  # 👈 Replace old reshape line

    return eeg
@torch.no_grad()
def compute_spec(signal):
    signal = torch.tensor(signal, dtype=torch.float32)
    spec = spec_transform(signal)
    spec = spec[:, :, 2:98]
    spec = torch.abs(spec) / 15
    spec = torch.log(spec.clip(math.exp(-4), math.exp(7)))
    spec = spec.mean(dim=1)
    return spec.numpy()
def compute_spec_eeg(a, b):
    return butter_filter(a - b, cutoff_freq=[0.25, 40], order=5)

def compute_spec_chain(df):
    eeg = [df[col].to_numpy() for col in ["Fp1","Fp2","Fz","Cz","Pz","F3","F4","F7","F8","C3","C4","P3","P4","T3","T4","T5","T6","O1","O2"]]
    
    def pair(a, b): 
        return compute_spec_eeg(a, b)
    ll = [pair(eeg[0], eeg[7]), pair(eeg[7], eeg[13]), pair(eeg[13], eeg[15]), pair(eeg[15], eeg[17])]
    lp = [pair(eeg[0], eeg[5]), pair(eeg[5], eeg[9]), pair(eeg[9], eeg[11]), pair(eeg[11], eeg[17])]
    rp = [pair(eeg[1], eeg[6]), pair(eeg[6], eeg[10]), pair(eeg[10], eeg[12]), pair(eeg[12], eeg[18])]
    rl = [pair(eeg[1], eeg[8]), pair(eeg[8], eeg[14]), pair(eeg[14], eeg[16]), pair(eeg[16], eeg[18])]
    
    chain = np.stack([ll, lp, rp, rl])
    chain = chain / (MAD(chain, axis=-1).mean() + 1e-5)
    return compute_spec(chain[:, 0])
def resolve_path(eeg_id, mode="train"):
    subdir = TRAIN_EEG_PATH if mode == "train" else TEST_EEG_PATH
    return os.path.join(subdir, f"{eeg_id}.parquet")

def compute_spec_from_file(path):
    try:
        df = pl.read_parquet(path).fill_null(0)
        return compute_spec_chain(df)
    except Exception as e:
        print(f"Failed to read or process spec from {path}: {e}")
        return None

def compute_eeg_from_file(path):
    try:
        df = pl.read_parquet(path).fill_null(0)
        return compute_eeg_chain(df)
    except Exception as e:
        print(f"Failed to read or process EEG from {path}: {e}")
        return None
def proc_kspec(x):
    # Slice the data (based on your specific needs)
    x = x[:, 2:98]
    
    # Handle NaN and infinite values
    x[np.isnan(x) | np.isinf(x)] = 0
    
    # Apply log transform (clip to avoid extremely small or large values)
    x = np.log(np.clip(x, np.exp(-4), np.exp(7)))
    
    # Normalize along the correct axis (axis=1 for channels)
    x = (x - x.mean(axis=1, keepdims=True)) / (x.std(axis=1, keepdims=True) + 1e-5)
    
    # Apply any additional spec transformations
    x = spec_transforms(image=x)["image"]
    
    # Print shape to debug
    #print(x.shape)
    
    # Adjust reshape based on the actual number of elements
    return x.reshape(4, 48, 112)  # Adjust based on the data size
def proc_eeg_spec(x):
    x = x[:, :, 2:-2]
    x[np.isnan(x) | np.isinf(x)] = 0
    x += 1
    return x.reshape(4, 96, 224)
import os
import numpy as np
from tqdm import tqdm
import polars as pl

# Config
SAVE_DIR = os.path.join(BASE_PATH, "\preprocessed")
BATCH_SIZE = 100  # Change this to control batch size

# Create output directories
os.makedirs(os.path.join(SAVE_DIR, "eeg"), exist_ok=True)
os.makedirs(os.path.join(SAVE_DIR, "spec"), exist_ok=True)

# Input EEG directory
eeg_dir = os.path.join(BASE_PATH, "train_eegs")
eeg_files = sorted(f for f in os.listdir(eeg_dir) if f.endswith(".parquet"))

# Skip already processed files (resumable batches)
already_processed = set(f.replace(".npy", "") for f in os.listdir(os.path.join(SAVE_DIR, "eeg")))
eeg_files = [f for f in eeg_files if f.replace(".parquet", "") not in already_processed]

# Tracking
failed_files = []
success_files = []
partial_success_files = []
for i in range(0, len(eeg_files), BATCH_SIZE):
    batch = eeg_files[i:i + BATCH_SIZE]
    print(f"\n🔄 Processing batch {i // BATCH_SIZE + 1} / {(len(eeg_files) - 1) // BATCH_SIZE + 1}")

    for fname in tqdm(batch, desc="Processing EEGs"):
        eeg_id = fname.replace(".parquet", "")
        path = os.path.join(eeg_dir, fname)

        try:
            df = pl.read_parquet(path).fill_null(0)
            eeg_success, spec_success = False, False

            # EEG Processing
            try:
                eeg, mid, ekg = compute_eeg_chain(df)
                eeg_processed = proc_eeg(eeg, mid, ekg)
                np.save(os.path.join(SAVE_DIR, "eeg", f"{eeg_id}.npy"), eeg_processed)
                eeg_success = True
            except Exception as e:
                print(f"[EEG FAIL] {eeg_id}: {e}")
                failed_files.append((eeg_id, "eeg"))
            try:
                spec = compute_spec_chain(df)
                spec_processed = proc_kspec(spec)
                np.save(os.path.join(SAVE_DIR, "spec", f"{eeg_id}.npy"), spec_processed)
                spec_success = True
            except Exception as e:
                print(f"[SPEC FAIL] {eeg_id}: {e}")
                failed_files.append((eeg_id, "spec"))

            # Logging result
            if eeg_success and spec_success:
                success_files.append(eeg_id)
            elif eeg_success or spec_success:
                partial_success_files.append(eeg_id)

        except Exception as e:
            print(f"[FILE FAIL] {eeg_id}: {e}")
            failed_files.append((eeg_id, "file"))

# Summary
print(f"\n✅ Fully preprocessed files: {len(success_files)}")
print(f"⚠  Partially preprocessed files: {len(partial_success_files)}")
print(f"❌ Total failed files: {len(failed_files)}")

pd.DataFrame(success_files, columns=["eeg_id"]).to_csv(os.path.join(SAVE_DIR, "success.csv"), index=False)
pd.DataFrame(partial_success_files, columns=["eeg_id"]).to_csv(os.path.join(SAVE_DIR, "partial_success.csv"), index=False)
pd.DataFrame(failed_files, columns=["eeg_id", "fail_type"]).to_csv(os.path.join(SAVE_DIR, "failures.csv"), index=False)