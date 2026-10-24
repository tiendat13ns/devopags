export function parseIp(value: string): number | null {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    result = result * 256 + octet;
  }
  return result;
}

export function formatIp(value: number) {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join('.');
}

export function maskOf(prefix: number) {
  // Dịch trái 32 bit trong JS bị quay vòng nên /0 phải xử lý riêng.
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function networkOf(ip: number, prefix: number) {
  return (ip & maskOf(prefix)) >>> 0;
}

export function inCidr(ip: number, cidr: string) {
  const [base, length] = cidr.split('/');
  const baseIp = parseIp(base);
  const prefix = Number(length);
  if (baseIp === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
  return networkOf(ip, prefix) === networkOf(baseIp, prefix);
}

export function toBits(value: number) {
  return value.toString(2).padStart(32, '0');
}
