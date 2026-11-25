"""
Scan a directory for image files and generate IMAGE_SETS pairs.

Pairing rules (checked in order):
1. If one file is the same name as another with a leading underscore: "car.png" <-> "_car.png".
2. If one file is the same name as another with a trailing 1: "car.png" <-> "car1.png".
3. If one file is the same name as another with a trailing "_1": "car.png" <-> "car_1.png".
4. If none of the above, the file will be listed as (filename, None).

Usage:
    python generate_image_sets.py PATH_TO_FOLDER --output image_sets.py

The script writes an output Python file containing IMAGE_SETS = [...] and also prints a summary.

Assumptions:
- Image extensions supported: .png, .jpg, .jpeg, .gif, .webp, .bmp, .svg
- Filenames compared case-sensitively. If you want case-insensitive matching, pass --ignore-case.
- If multiple possible matches exist, the script picks the first matching rule and avoids reusing files.
"""

import argparse
import os
import sys
from os.path import splitext, join

ALLOWED_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'}


def find_image_files(folder, ignore_case=False):
    files = []
    for entry in os.listdir(folder):
        path = join(folder, entry)
        if os.path.isfile(path):
            name, ext = splitext(entry)
            if ext.lower() in ALLOWED_EXTS:
                files.append(entry if not ignore_case else entry.lower())
    return sorted(files)


def build_pairs(files):
    files_set = set(files)
    used = set()
    pairs = []

    for f in files:
        if f in used:
            continue
        name, ext = splitext(f)

        # rule 1: counterpart with leading underscore
        alt1 = '_' + name + ext
        if alt1 in files_set and alt1 not in used:
            # prefer the non-underscore as first item when possible
            if f.startswith('_'):
                pairs.append((alt1, f))
            else:
                pairs.append((f, alt1))
            used.add(f); used.add(alt1)
            continue

        # rule 2: trailing 1 (e.g., car.png <-> car1.png)
        alt2 = name + '1' + ext
        if alt2 in files_set and alt2 not in used:
            pairs.append((f, alt2))
            used.add(f); used.add(alt2)
            continue

        # rule 3: trailing _1 (e.g., car.png <-> car_1.png)
        alt3 = name + '_1' + ext
        if alt3 in files_set and alt3 not in used:
            pairs.append((f, alt3))
            used.add(f); used.add(alt3)
            continue

        # rule 4: check if f starts with '_' and base exists
        if name.startswith('_'):
            base = name.lstrip('_') + ext
            if base in files_set and base not in used:
                pairs.append((base, f))
                used.add(f); used.add(base)
                continue

        # no match found
        pairs.append((f, None))
        used.add(f)

    return pairs


def write_output(pairs, out_path):
    lines = []
    lines.append('# Auto-generated IMAGE_SETS')
    lines.append('')
    lines.append('IMAGE_SETS = [')
    for a, b in pairs:
        a_repr = repr(a) if a is not None else 'None'
        b_repr = repr(b) if b is not None else 'None'
        lines.append(f'    ({a_repr}, {b_repr}),')
    lines.append(']')
    lines.append('')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    parser = argparse.ArgumentParser(description='Generate IMAGE_SETS from a folder of images')
    parser.add_argument('folder', nargs='?', default='images', help='Folder to scan for images (default: kids)')
    parser.add_argument('--output', '-o', default='image_sets.py', help='Output Python file path (default: image_sets.py)')
    parser.add_argument('--ignore-case', action='store_true', help='Treat filenames case-insensitively when matching')
    args = parser.parse_args()

    folder = args.folder
    if not os.path.isdir(folder):
        print(f'Error: folder "{folder}" does not exist or is not a directory', file=sys.stderr)
        sys.exit(2)

    files = find_image_files(folder, ignore_case=args.ignore_case)
    if not files:
        print('No image files found in the folder.')
        sys.exit(0)

    # If ignore_case was requested, we still want to write the original filenames in output
    # so we re-list actual files matching the lowercased names if necessary
    if args.ignore_case:
        # Build a map from lowercased to actual filename (first occurrence)
        actual_map = {}
        for entry in os.listdir(folder):
            path = join(folder, entry)
            if os.path.isfile(path):
                name, ext = splitext(entry)
                if ext.lower() in ALLOWED_EXTS:
                    key = entry.lower()
                    if key not in actual_map:
                        actual_map[key] = entry
        files_actual = [actual_map[f] for f in files if f in actual_map]
        pairs = build_pairs(files_actual)
    else:
        pairs = build_pairs(files)

    out_path = args.output
    write_output(pairs, out_path)

    print(f'Found {len(files)} images. Generated {len(pairs)} pairs and wrote to "{out_path}"')


if __name__ == '__main__':
    # Add a small wrapper to surface unexpected errors and a start message for debugging
    try:
        print('generate_image_sets.py starting...')
        main()
        print('generate_image_sets.py finished successfully.')
    except Exception as e:
        print('Error running generate_image_sets.py:', file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
