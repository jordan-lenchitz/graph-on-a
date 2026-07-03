#!/bin/bash
# scripts/build_initramfs.sh
set -e

DIR="ubuntu_initramfs_root"
echo "Bootstrapping minimal Ubuntu (noble)..."
mkdir -p $DIR
sudo debootstrap --variant=minbase noble $DIR http://archive.ubuntu.com/ubuntu/

echo "Installing kernel in chroot..."
# linux-image-kvm is much smaller and faster to boot in VMs than generic
sudo chroot $DIR apt-get update
sudo chroot $DIR apt-get install -y linux-image-kvm

echo "Creating custom /init boot script..."
# The kernel executes /init when it boots an initramfs
cat << 'EOF' | sudo tee $DIR/init
#!/bin/sh
# Mount essential virtual filesystems
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev

# Set up basic networking (loopback)
ip link set lo up

echo "========================================="
echo " Welcome to Ubuntu In-Memory WASM VM! "
echo "========================================="

# Execute a bash shell as the main process
exec /bin/bash
EOF
sudo chmod +x $DIR/init

echo "Extracting the kernel..."
# Copy the installed kernel out of the chroot so v86 can load it
cp $DIR/boot/vmlinuz-* ./vmlinuz-ubuntu

echo "Packaging the filesystem into an initramfs (this may take a minute)..."
# Pack the entire rootfs into a compressed cpio archive
(cd $DIR && sudo find . | sudo cpio -o -H newc | gzip -9 > ../initramfs-ubuntu)

echo "Cleaning up..."
sudo rm -rf $DIR

echo "Done! Generated 'vmlinuz-ubuntu' and 'initramfs-ubuntu'."
