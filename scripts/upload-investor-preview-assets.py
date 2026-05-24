import argparse
import json
import mimetypes
import os
import sys
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--url", default=os.environ.get("SUPABASE_URL"))
    parser.add_argument("--key", default=os.environ.get("SUPABASE_PUBLISHABLE_KEY") or os.environ.get("SUPABASE_ANON_KEY"))
    args = parser.parse_args()

    if not args.url or not args.key:
        raise SystemExit("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY/SUPABASE_ANON_KEY are required")

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    for item in manifest:
        upload(args.url.rstrip("/"), args.key, Path(item["preview_path"]), item["storage_path"], item["mime_type"])
        print(f"uploaded {item['storage_path']}")


def upload(base_url: str, key: str, local_path: Path, storage_path: str, content_type: str | None) -> None:
    if not local_path.exists():
        raise FileNotFoundError(local_path)

    content_type = content_type or mimetypes.guess_type(local_path.name)[0] or "application/octet-stream"
    encoded_path = "/".join(quote(part) for part in storage_path.split("/"))
    url = f"{base_url}/storage/v1/object/investor-documents/{encoded_path}"
    request = Request(
        url,
        data=local_path.read_bytes(),
        method="POST",
        headers={
            "Authorization": f"Bearer {key}",
            "apikey": key,
            "Content-Type": content_type,
            "Cache-Control": "3600",
        },
    )

    try:
        with urlopen(request, timeout=60) as response:
            if response.status not in {200, 201}:
                raise RuntimeError(f"Upload failed for {storage_path}: HTTP {response.status}")
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        print(body, file=sys.stderr)
        raise


if __name__ == "__main__":
    main()
