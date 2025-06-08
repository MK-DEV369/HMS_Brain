import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import spectrogram, detrend
from scipy.ndimage import zoom

# === Configuration ===
BASE_DIR = r"E:\4th SEM Data\HMS_Main_EL\HMS-Brian\project\backend\intelligence\preprocessed"
EEG_DIR = os.path.join(BASE_DIR, "eeg")
SPEC_DIR = os.path.join(BASE_DIR, "spec")
SAMPLE_RATE = 200
SEGMENT_DURATION = 5000  # center 25 seconds (5000 samples at 200 Hz)
N_MELS = 128  # Placeholder for compatibility, not used
N_FFT = 1024
WIN_LENGTH = 128

# Montages for spectrograms
MONTAGES = {
    'LL': ['Fp1', 'F7', 'T3', 'T5', 'O1'],
    'LP': ['Fp1', 'F3', 'C3', 'P3', 'O1'],
    'RP': ['Fp2', 'F8', 'T4', 'T6', 'O2'],
    'RR': ['Fp2', 'F4', 'C4', 'P4', 'O2']
}

EEG_CHANNELS = [
    "Fp1", "Fp2", "Fz", "Cz", "Pz", "F3", "F4", "F7", "F8",
    "C3", "C4", "P3", "P4", "T3", "T4", "T5", "T6", "O1", "O2"
]

def spectrogram_from_eeg_npy(npy_path, output_dir="spectrograms", display=False):
    basename = os.path.basename(npy_path).replace(".npy", "")
    eeg = np.load(npy_path)
    
    if eeg.shape[0] != 19:
        raise ValueError(f"Expected 19 channels, got {eeg.shape[0]}")
    
    eeg_dict = {ch: eeg[i] for i, ch in enumerate(EEG_CHANNELS)}
    
    # Check actual signal length and adjust segment extraction
    total_len = eeg.shape[1]
    print(f"Processing {basename}: Total length = {total_len} samples")
    
    # Use the entire signal if it's shorter than expected, otherwise take center segment
    if total_len <= SEGMENT_DURATION:
        start = 0
        end = total_len
        actual_duration = total_len
        print(f"  Using entire signal: {actual_duration} samples")
    else:
        start = max(0, total_len // 2 - SEGMENT_DURATION // 2)
        end = start + SEGMENT_DURATION
        actual_duration = SEGMENT_DURATION
        print(f"  Using center segment: {actual_duration} samples (from {start} to {end})")
    
    img = np.zeros((128, 256, 4), dtype=np.float32)  # 128 frequency bins, 256 time bins, 4 montages
    
    for k, (montage_name, ch_list) in enumerate(MONTAGES.items()):
        montage_spectrograms = []
        
        for i in range(4):
            a, b = ch_list[i], ch_list[i + 1]
            x = eeg_dict[a][start:end] - eeg_dict[b][start:end]
            
            # Clean signal
            if np.isnan(x).any():
                x = np.nan_to_num(x, nan=np.nanmean(x[~np.isnan(x)]) if np.any(~np.isnan(x)) else 0)
            
            # Remove DC component and linear trend
            x = x - np.mean(x)
            x = detrend(x)
            
            # Skip if signal is too short or all zeros
            if len(x) < WIN_LENGTH or np.all(x == 0):
                print(f"  Warning: Skipping {a}-{b} (insufficient data)")
                continue
            
            # Calculate spectrogram with adjusted parameters for shorter signals
            nperseg = min(WIN_LENGTH, len(x))
            noverlap = nperseg // 2
            
            try:
                f, t, Sxx = spectrogram(
                    x,
                    fs=SAMPLE_RATE,
                    nperseg=nperseg,
                    noverlap=noverlap,
                    nfft=N_FFT,
                    scaling='density'
                )
                
                print(f"  {montage_name} {a}-{b}: Original spectrogram shape = {Sxx.shape}")
                
                # Convert to decibels and normalize
                Sxx = 10 * np.log10(Sxx + 1e-10)
                Sxx = (Sxx - np.min(Sxx)) / (np.max(Sxx) - np.min(Sxx) + 1e-10)
                
                # Resize to target dimensions (128 freq bins, 256 time bins)
                target_freq_bins = 128
                target_time_bins = 256
                
                # First, resize frequency dimension to 128 bins
                if Sxx.shape[0] != target_freq_bins:
                    freq_zoom_factor = target_freq_bins / Sxx.shape[0]
                    Sxx = zoom(Sxx, (freq_zoom_factor, 1), order=1)
                
                # Then, resize time dimension to 256 bins
                if Sxx.shape[1] != target_time_bins:
                    time_zoom_factor = target_time_bins / Sxx.shape[1]
                    Sxx = zoom(Sxx, (1, time_zoom_factor), order=1)
                
                print(f"  {montage_name} {a}-{b}: Final spectrogram shape = {Sxx.shape}")
                
                # Ensure exact dimensions
                Sxx = Sxx[:target_freq_bins, :target_time_bins]
                montage_spectrograms.append(Sxx)
                
            except Exception as e:
                print(f"  Error computing spectrogram for {a}-{b}: {e}")
                continue
        
        # Average the spectrograms for this montage
        if montage_spectrograms:
            img[:, :, k] = np.mean(montage_spectrograms, axis=0)
        else:
            print(f"  Warning: No valid spectrograms for montage {montage_name}")
        
        if display:
            plt.subplot(2, 2, k + 1)
            plt.imshow(img[:, :, k], aspect='auto', origin='lower', cmap='viridis')
            plt.title(f'{montage_name} (non-zero: {np.count_nonzero(img[:, :, k])})')
            plt.xlabel('Time bins')
            plt.ylabel('Frequency bins')
    
    if display:
        plt.tight_layout()
        plt.show()
    
    # Print statistics about the final spectrogram
    total_elements = img.size
    non_zero_elements = np.count_nonzero(img)
    print(f"  Final spectrogram: {img.shape}, non-zero elements: {non_zero_elements}/{total_elements} ({100*non_zero_elements/total_elements:.1f}%)")
    
    os.makedirs(output_dir, exist_ok=True)
    np.save(os.path.join(output_dir, f"{basename}.npy"), img)
    return img

# Process all EEG files in the directory
if __name__ == "__main__":
    os.makedirs(SPEC_DIR, exist_ok=True)  # Ensure the output directory exists
    
    # Iterate through all .npy files in the EEG directory
    for filename in sorted(os.listdir(EEG_DIR)):
        if filename.endswith(".npy"):
            npy_path = os.path.join(EEG_DIR, filename)
            print(f"\n{'='*50}")
            print(f"Processing: {filename}")
            print(f"{'='*50}")
            try:
                spectrogram_from_eeg_npy(npy_path, output_dir=SPEC_DIR, display=False)
                print(f"✓ Successfully processed {filename}")
            except Exception as e:
                print(f"✗ Error processing {filename}: {e}")
                import traceback
                traceback.print_exc()