#!/bin/bash
set -e

DIR="ubuntu_initramfs_root"
echo "Bootstrapping minimal Ubuntu (noble)..."
mkdir -p $DIR
sudo debootstrap --variant=minbase noble $DIR http://archive.ubuntu.com/ubuntu/

echo "Installing kernel in chroot..."
sudo chroot $DIR apt-get update
sudo chroot $DIR apt-get install -y linux-image-kvm

echo "Creating custom /init boot script..."
cat << 'EOF' | sudo tee $DIR/init
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev

ip link set lo up

echo "========================================="
echo " Welcome to Ubuntu In-Memory WASM VM! "
echo "========================================="

exec /bin/bash
EOF
sudo chmod +x $DIR/init

echo "Extracting the kernel..."
cp $DIR/boot/vmlinuz-* ./vmlinuz-ubuntu

echo "Packaging the filesystem into an initramfs (this may take a minute)..."
(cd $DIR && sudo find . | sudo cpio -o -H newc | gzip -9 > ../initramfs-ubuntu)

echo "Cleaning up..."
sudo rm -rf $DIR

echo "Done! Generated 'vmlinuz-ubuntu' and 'initramfs-ubuntu'."
