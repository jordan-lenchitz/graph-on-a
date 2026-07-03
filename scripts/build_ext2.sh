#!/bin/bash
# scripts/build_ext2.sh
# This script generates a 1GB ext2 image with YottaDB installed.
# It MUST be run with sudo in a local Linux environment.

set -e # Exit on error

IMAGE_NAME="ydb-image-256m.ext2"
MOUNT_DIR="./mnt_ydb"

# Pre-flight check
if ! command -v debootstrap &> /dev/null; then
    echo "ERROR: 'debootstrap' is not installed."
    echo "Please run: sudo apt-get update && sudo apt-get install -y debootstrap"
    exit 1
fi

echo "Creating 256MB sparse file..."
truncate -s 256M $IMAGE_NAME

echo "Formatting as ext2..."
mkfs.ext2 $IMAGE_NAME

echo "Mounting image..."
mkdir -p $MOUNT_DIR
sudo mount -o loop $IMAGE_NAME $MOUNT_DIR

# Ensure unmount on script exit/error
cleanup() {
    echo "Cleaning up mounts..."
    sudo umount "$MOUNT_DIR/dev/pts" || true
    sudo umount "$MOUNT_DIR/dev" || true
    sudo umount "$MOUNT_DIR/sys" || true
    sudo umount "$MOUNT_DIR/proc" || true
    sudo umount "$MOUNT_DIR" || true
    [ -d "$MOUNT_DIR" ] && rmdir "$MOUNT_DIR" || true
}
trap cleanup EXIT

echo "Bootstrapping minimal Ubuntu environment (this takes a few minutes)..."
sudo debootstrap --variant=minbase noble $MOUNT_DIR http://archive.ubuntu.com/ubuntu/

# Mount virtual filesystems (Crucial for YottaDB path resolution)
# These MUST happen after debootstrap so the directories exist
echo "Mounting virtual filesystems..."
sudo mount -t proc /proc "$MOUNT_DIR/proc"
sudo mount -t sysfs /sys "$MOUNT_DIR/sys"
sudo mount --bind /dev "$MOUNT_DIR/dev"
sudo mount --bind /dev/pts "$MOUNT_DIR/dev/pts"

echo "Preparing installation script..."
cat << 'EOF' > install_ydb_internal.sh
#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "Updating and installing dependencies..."
apt-get update
apt-get install -y wget procps libelf1 binutils libc-bin file libicu-dev locales

echo "Generating locales..."
sed -i '/en_US.UTF-8/s/^# //' /etc/locale.gen
locale-gen
export LANG=en_US.UTF-8
export LANGUAGE=en_US:en
export LC_ALL=en_US.UTF-8

echo "Downloading YottaDB installer..."
wget -q https://gitlab.com/YottaDB/DB/YDB/raw/master/sr_unix/ydbinstall.sh
chmod +x ydbinstall.sh

echo "Running YottaDB installation..."
./ydbinstall.sh --utf8 default

echo "Verifying installation..."
/usr/local/lib/yottadb/r206/yottadb -version
EOF

sudo mv install_ydb_internal.sh "$MOUNT_DIR/install_ydb_internal.sh"
sudo chmod +x "$MOUNT_DIR/install_ydb_internal.sh"

echo "Entering chroot to install YottaDB..."
sudo chroot "$MOUNT_DIR" /install_ydb_internal.sh

echo "Cleaning up internal script..."
sudo rm "$MOUNT_DIR/install_ydb_internal.sh"

echo ""
echo "SUCCESS: $IMAGE_NAME created with YottaDB installed."
echo "Upload this to your GCS bucket: gcloud storage cp $IMAGE_NAME gs://jordanlenchitz-xyz-assets/"
