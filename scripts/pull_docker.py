#!/usr/bin/env python3
import urllib.request
import json
import os
import tarfile
import io
import sys

IMAGE_NAME = 'ajndjd2/ahmed-vip1'
OUTPUT_DIR = '/tmp/docker-images/ahmed-vip1'

def pull_image(image_name=IMAGE_NAME, output_dir=OUTPUT_DIR):
    os.makedirs(output_dir, exist_ok=True)
    print(f"[*] Authentification auprès de Docker Hub pour {image_name}...")
    sys.stdout.flush()
    auth_url = f"https://auth.docker.io/token?service=registry.docker.io&scope=repository:{image_name}:pull"
    req = urllib.request.Request(auth_url)
    with urllib.request.urlopen(req) as resp:
        token = json.loads(resp.read().decode('utf-8'))['token']

    print(f"[*] Récupération du manifeste de l'image...")
    sys.stdout.flush()
    manifest_url = f"https://registry-1.docker.io/v2/{image_name}/manifests/latest"
    req2 = urllib.request.Request(manifest_url, headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.docker.distribution.manifest.v2+json'
    })
    with urllib.request.urlopen(req2) as resp2:
        manifest = json.loads(resp2.read().decode('utf-8'))

    layers = manifest.get('layers', [])
    print(f"[*] {len(layers)} couches trouvées. Extraction dans {output_dir}...")
    sys.stdout.flush()

    for idx, layer in enumerate(layers):
        digest = layer['digest']
        size_mb = round(layer.get('size', 0) / (1024 * 1024), 2)
        print(f"  [+] Téléchargement couche {idx+1}/{len(layers)} ({size_mb} MB)...")
        sys.stdout.flush()
        layer_url = f"https://registry-1.docker.io/v2/{image_name}/blobs/{digest}"
        lreq = urllib.request.Request(layer_url, headers={'Authorization': f'Bearer {token}'})
        with urllib.request.urlopen(lreq) as lresp:
            data = lresp.read()
            try:
                with tarfile.open(fileobj=io.BytesIO(data), mode='r:*') as tar:
                    tar.extractall(path=output_dir)
            except Exception as e:
                print(f"      Avertissement extraction: {e}")
                sys.stdout.flush()

    binary_path = os.path.join(output_dir, 'usr/bin/v2ray')
    if os.path.exists(binary_path):
        os.chmod(binary_path, 0o755)
        print(f"[✔] Image Docker {image_name} extraite avec succès ! Binaire v2ray prêt: {binary_path}")
        sys.stdout.flush()
        return True
    else:
        print(f"[!] Binaire v2ray non trouvé dans {binary_path}")
        sys.stdout.flush()
        return False

if __name__ == '__main__':
    pull_image()
