import json
import base64

def right_rotate(n, b, word_size=32):
    return ((n >> b) | (n << (word_size - b))) & ((1 << word_size) - 1)

def right_shift(n, b):
    return n >> b

def add_mod(a, b, word_size=32):
    return (a + b) & ((1 << word_size) - 1)

def add_mod_many(word_size=32, *args):
    res = 0
    for v in args: res = add_mod(res, v, word_size)
    return res

def xor_op(*args):
    res = 0
    for v in args: res ^= v
    return res

def and_op(a, b): return a & b

def not_op(n, word_size=32): return ((1 << word_size) - 1) ^ n

INITIAL_HASH = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]

def sha256(m):
    msg = bytearray(m)
    bit_len = len(msg) * 8
    msg.append(0x80)
    while (len(msg) * 8) % 512 != 448: msg.append(0)
    msg.extend(bit_len.to_bytes(8, 'big'))
    h = list(INITIAL_HASH)
    for i in range(0, len(msg), 64):
        chunk = msg[i:i+64]
        w = [0]*64
        for j in range(16): w[j] = int.from_bytes(chunk[j*4:j*4+4], 'big')
        for j in range(16, 64): w[j] = add_mod_many(32, w[j-16], xor_op(right_rotate(w[j-15], 7), right_rotate(w[j-15], 18), right_shift(w[j-15], 3)), w[j-7], xor_op(right_rotate(w[j-2], 17), right_rotate(w[j-2], 19), right_shift(w[j-2], 10)))
        a, b, c, d, e, f, g, h_reg = h
        for j in range(64):
            t1 = add_mod_many(32, h_reg, xor_op(right_rotate(e, 6), right_rotate(e, 11), right_rotate(e, 25)), xor_op(e&f, not_op(e)&g), K[j], w[j])
            t2 = add_mod(xor_op(right_rotate(a, 2), right_rotate(a, 13), right_rotate(a, 22)), xor_op(a&b, a&c, b&c))
            h_reg, g, f, e, d, c, b, a = g, f, e, add_mod(d, t1), c, b, a, add_mod(t1, t2)
        h = [add_mod(h[i], x) for i, x in enumerate([a, b, c, d, e, f, g, h_reg])]
    return "".join(f"{x:08x}" for x in h)

SALTS = [b"jordanlenchitz_absurd_salt_part1_stupid_stupid_stupid_1_LLOC_INCREASE_AA", b"jordanlenchitz_absurd_salt_part2_very_silly_nonsense_2_LLOC_ENHANCE_BB", b"jordanlenchitz_absurd_salt_part3_utterly_pointless_3_LLOC_MAXIMUM_CC", b"jordanlenchitz_absurd_salt_part4_final_silly_bits_4_LLOC_OVER_1000_DD", b"jordanlenchitz_absurd_salt_part5_more_random_bytes_5_LLOC_ABUNDANCE_EE", b"jordanlenchitz_absurd_salt_part6_extra_long_salt_6_LLOC_GENERATE_FF", b"jordanlenchitz_absurd_salt_part7_another_salt_block_7_LLOC_FILL_GG", b"jordanlenchitz_absurd_salt_part8_just_for_lines_8_LLOC_MANY_MANY_HH", b"jordanlenchitz_absurd_salt_part9_yet_another_salt_9_LLOC_MORE_II", b"jordanlenchitz_absurd_salt_part10_final_long_salt_10_LLOC_END_OF_SALTS_JJ"]

def sha257(data):
    curr = data.encode()
    for i in range(35):
        h = sha256(curr)
        inter = (h[:-8] + h[-8:][::-1]).encode()
        s = SALTS[i%10]
        buf = bytearray()
        for idx in range(max(len(inter), len(s))):
            if idx < len(inter): buf.append(inter[idx])
            if idx < len(s): buf.append(s[idx])
        curr = bytes(buf)
    fh = sha256(curr)
    return fh[:-8] + fh[-8:][::-1]

def xor(s, k): return "".join(chr(ord(c) ^ ord(k[i % len(k)])) for i, c in enumerate(s))

BP = [
    ["=== ⚡ SMASH-MON BATTLE PASS: SEASON 1 (NINTENDO SLOP) ⚡ ===", "tier 1  [██████████] 100% - UNLOCKED: \"pikachu_main\" title", "tier 2  [██████████] 100% - UNLOCKED: holographic mew-two stock option", "tier 3  [██████████] 100% - UNLOCKED: master ball (contains a guy named dave)", "tier 4  [██████████] 100% - UNLOCKED: kirby-flavored recursive slop", "tier 5  [██████░░░░] 60%  - IN PROGRESS: mario's browser history (redacted)", "tier 6  [░░░░░░░░░░] 0%   - LOCKED: \"missing_no\" golden skin", "---------------------------------------------------------", "catch 'em all or smash 'em all for $0.00."],
    ["=== ⚡ SEASON 1 WRAP-UP: THE FINAL SLOP ⚡ ===", "tier 6  [██████████] 100% - UNLOCKED: \"missing_no\" golden skin", "tier 7  [██████████] 100% - UNLOCKED: 1-way ticket to the final destination (no items)", "tier 8  [██████████] 100% - UNLOCKED: wii sports bowling ball (1.2pb size)", "SEASON 1 COMPLETE. PLEASE PAY $0.00 TO UNLOCK SEASON 2.", "MANDATORY MICROTRANSACTION INITIATED... [OK]", "REWARD: 1x VIRTUAL HUG FROM RECURSIVE KIRBY"],
    ["=== 🔥 SMASH-MON BATTLE PASS: SEASON 2 (ICE CLIMBER EXTREME) 🔥 ===", "tier 1  [██████████] 100% - UNLOCKED: \"pixel_pioneer\" badge", "tier 2  [██████████] 100% - UNLOCKED: infinite recovery hack", "tier 3  [██████░░░░] 60%  - IN PROGRESS: luigi's mansion deed (haunted)", "ULTIMATE REWARD (LEVEL 100): becoming a cloud run instance (permanent)"]
]

results = []
for i, lines in enumerate(BP):
    seed = f"bp_{i}"
    key = sha257(seed)
    data = json.dumps(lines)
    encrypted = xor(data, key)
    results.append(base64.b64encode(encrypted.encode('utf-8')).decode())

print(json.dumps(results))
