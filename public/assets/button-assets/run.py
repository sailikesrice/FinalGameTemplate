import os
import sys
from PIL import Image

def process_images(directory):
    """
    Scans for PNGs, removes white backgrounds, 
    resizes to 32x32, and saves as lossless WebP.
    """
    # Verify directory exists
    if not os.path.isdir(directory):
        print(f"Error: Directory '{directory}' not found.")
        return

    # Get all PNG files
    files = [f for f in os.listdir(directory) if f.lower().endswith('.png')]

    if not files:
        print("No PNG files found in this directory.")
        return

    print(f"Found {len(files)} PNG files. Starting conversion to 32x32 WebP...")

    for filename in files:
        file_path = os.path.join(directory, filename)
        
        try:
            with Image.open(file_path) as img:
                # 1. Convert to RGBA
                img = img.convert("RGBA")
                
                # 2. Get pixel data
                datas = img.getdata()
                new_data = []
                
                # 3. Replace White with Transparent
                for item in datas:
                    if item[0] == 255 and item[1] == 255 and item[2] == 255:
                        new_data.append((255, 255, 255, 0)) # Transparent
                    else:
                        new_data.append(item)
                
                # Update image data with the transparent background
                img.putdata(new_data)

                # 4. Resize to 32x32
                # We use LANCZOS for the highest quality downsampling
                img = img.resize((32, 32), Image.Resampling.LANCZOS)
                
                # 5. Generate new filename
                file_name_no_ext = os.path.splitext(file_path)[0]
                new_file_path = f"{file_name_no_ext}.webp"
                
                # 6. Save as WebP
                img.save(new_file_path, "WEBP", lossless=True)
                
                print(f"[OK] Processed: {filename} -> 32x32 WebP")

        except Exception as e:
            print(f"[ERROR] Could not process {filename}: {e}")

    print("--- Batch Processing Complete ---")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_dir = sys.argv[1]
    else:
        target_dir = os.getcwd()

    process_images(target_dir)