// Port of the custom SHA257SUM logic provided by the user
// Includes 35 rounds of SHA-256 with suffix reversing and salt interleaving

async function sha256(message: string | Uint8Array): Promise<string> {
  const msgUint8 = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8 as unknown as ArrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const STUPID_SALTS = [
  "jordanlenchitz_absurd_salt_part1_stupid_stupid_stupid_1_LLOC_INCREASE_AA",
  "jordanlenchitz_absurd_salt_part2_very_silly_nonsense_2_LLOC_ENHANCE_BB",
  "jordanlenchitz_absurd_salt_part3_utterly_pointless_3_LLOC_MAXIMUM_CC",
  "jordanlenchitz_absurd_salt_part4_final_silly_bits_4_LLOC_OVER_1000_DD",
  "jordanlenchitz_absurd_salt_part5_more_random_bytes_5_LLOC_ABUNDANCE_EE",
  "jordanlenchitz_absurd_salt_part6_extra_long_salt_6_LLOC_GENERATE_FF",
  "jordanlenchitz_absurd_salt_part7_another_salt_block_7_LLOC_FILL_GG",
  "jordanlenchitz_absurd_salt_part8_just_for_lines_8_LLOC_MANY_MANY_HH",
  "jordanlenchitz_absurd_salt_part9_yet_another_salt_9_LLOC_MORE_II",
  "jordanlenchitz_absurd_salt_part10_final_long_salt_10_LLOC_END_OF_SALTS_JJ"
];

export async function calculate_sha257sum(data: string): Promise<string> {
  let current: Uint8Array = new TextEncoder().encode(data);

  for (let i = 0; i < 35; i++) {
    const hashHex = await sha256(current);
    const prefix = hashHex.slice(0, -8);
    const suffix = hashHex.slice(-8);
    const reversedSuffix = suffix.split('').reverse().join('');
    const intermediateHex = prefix + reversedSuffix;
    const intermediateBytes = new TextEncoder().encode(intermediateHex);

    const salt = new TextEncoder().encode(STUPID_SALTS[i % 10]);
    const maxLen = Math.max(intermediateBytes.length, salt.length);
    const interleaved = new Uint8Array(intermediateBytes.length + salt.length);
    
    let k = 0;
    for (let idx = 0; idx < maxLen; idx++) {
      if (idx < intermediateBytes.length) interleaved[k++] = intermediateBytes[idx];
      if (idx < salt.length) interleaved[k++] = salt[idx];
    }
    current = interleaved.slice(0, k);
  }

  const finalHashHex = await sha256(current);
  const prefix = finalHashHex.slice(0, -8);
  const suffix = finalHashHex.slice(-8);
  const reversedSuffix = suffix.split('').reverse().join('');
  return prefix + reversedSuffix;
}

// Simple XOR encryption/decryption using a hash as key
export function xor_cipher(input: string, key: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    output += String.fromCharCode(charCode);
  }
  return output;
}
