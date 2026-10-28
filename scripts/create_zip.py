import os
import zipfile

def create_archive():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    zip_root = os.path.join(root_dir, 'vless-manager.zip')
    zip_public = os.path.join(public_dir, 'vless-manager.zip')
    
    ignore_dirs = {'.git', 'node_modules', 'dist', '.aistudio', '__pycache__', '.vite'}
    ignore_files = {'vless-manager.zip', '.DS_Store'}
    
    included_count = 0
    with zipfile.ZipFile(zip_root, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for foldername, subfolders, filenames in os.walk(root_dir):
            # Prune ignored directories
            subfolders[:] = [d for d in subfolders if d not in ignore_dirs]
            
            for filename in filenames:
                if filename in ignore_files or filename.endswith('.pyc') or filename.endswith('.log'):
                    continue
                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, root_dir)
                zf.write(filepath, arcname)
                included_count += 1
                
    # Also copy to public directory for static serving
    import shutil
    shutil.copyfile(zip_root, zip_public)
    
    size_mb = os.path.getsize(zip_root) / (1024 * 1024)
    print(f"Archive successfully created: {zip_root} and {zip_public}")
    print(f"Total files: {included_count}, Size: {size_mb:.2f} MB")

if __name__ == '__main__':
    create_archive()
